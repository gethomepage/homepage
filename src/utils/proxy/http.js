import dns from "node:dns";
import net from "node:net";
import { createUnzip, constants as zlibConstants } from "node:zlib";

import { http, https } from "follow-redirects";
import cache from "memory-cache";

import { sanitizeErrorURL } from "./api-helpers";
import { addCookieToJar, setCookieHeader } from "./cookie-jar";

import createLogger from "utils/logger";

const logger = createLogger("httpProxy");

function addCookieHandler(url, params) {
  setCookieHeader(url, params);

  // handle cookies during redirects
  params.beforeRedirect = (options, responseInfo) => {
    addCookieToJar(options.href, responseInfo.headers);
    setCookieHeader(options.href, options);
  };
}

function handleRequest(requestor, url, params) {
  return new Promise((resolve, reject) => {
    addCookieHandler(url, params);
    if (params?.body) {
      params.headers = params.headers ?? {};
      params.headers["content-length"] = Buffer.byteLength(params.body);
    }

    const request = requestor.request(url, params, (response) => {
      const data = [];
      const contentEncoding = response.headers["content-encoding"]?.trim().toLowerCase();

      let responseContent = response;
      if (contentEncoding === "gzip" || contentEncoding === "deflate") {
        // https://github.com/request/request/blob/3c0cddc7c8eb60b470e9519da85896ed7ee0081e/request.js#L1018-L1025
        // Be more lenient with decoding compressed responses, in case of invalid gzip responses that are still accepted
        // by common browsers.
        responseContent = createUnzip({
          flush: zlibConstants.Z_SYNC_FLUSH,
          finishFlush: zlibConstants.Z_SYNC_FLUSH,
        });

        // zlib errors
        responseContent.on("error", (e) => {
          if (e) logger.error(e);
          responseContent = response; // fallback
        });
        response.pipe(responseContent);
      }

      responseContent.on("data", (chunk) => {
        data.push(chunk);
      });

      responseContent.on("end", () => {
        addCookieToJar(url, response.headers);
        resolve([response.statusCode, response.headers["content-type"], Buffer.concat(data), response.headers]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    if (params?.body) {
      request.write(params.body);
    }

    request.end();
  });
}

export function httpsRequest(url, params) {
  return handleRequest(https, url, params);
}

export function httpRequest(url, params) {
  return handleRequest(http, url, params);
}

export async function cachedRequest(url, duration = 5, ua = "homepage") {
  const cached = cache.get(url);

  if (cached) {
    return cached;
  }

  const options = {
    headers: {
      "User-Agent": ua,
      Accept: "application/json",
    },
  };
  let [, , data] = await httpProxy(url, options);
  if (Buffer.isBuffer(data)) {
    try {
      data = JSON.parse(Buffer.from(data).toString());
    } catch (e) {
      logger.debug("Error parsing cachedRequest data for %s: %s %s", url, Buffer.from(data).toString(), e);
      data = Buffer.from(data).toString();
    }
  }
  cache.put(url, data, duration * 1000 * 60);
  return data;
}

// Custom DNS lookup that falls back to Node.js c-ares resolver (dns.resolve)
// when system getaddrinfo (dns.lookup) fails with ENOTFOUND/EAI_NONAME.
// Fixes DNS resolution issues with Alpine/musl libc in k8s
const FALLBACK_CODES = new Set(["ENOTFOUND", "EAI_NONAME"]);

function homepageDNSLookupFn() {
  const normalizeOptions = (options) => {
    if (typeof options === "number") {
      return { family: options, all: false, lookupOptions: { family: options } };
    }

    const normalized = options ?? {};
    return {
      family: normalized.family,
      all: Boolean(normalized.all),
      lookupOptions: normalized,
    };
  };

  return (hostname, options, callback) => {
    // Handle case where options is the callback (2-argument form)
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    const { family, all, lookupOptions } = normalizeOptions(options);
    const sendResponse = (addr, fam) => {
      if (all) {
        let addresses = addr;
        if (!Array.isArray(addresses)) {
          addresses = [{ address: addresses, family: fam }];
        } else if (addresses.length && typeof addresses[0] === "string") {
          addresses = addresses.map((a) => ({ address: a, family: fam }));
        }

        callback(null, addresses);
      } else {
        callback(null, addr, fam);
      }
    };

    // If hostname is already an IP address, return it directly
    const ipVersion = net.isIP(hostname);
    if (ipVersion) {
      sendResponse(hostname, ipVersion);
      return;
    }

    // Try dns.lookup first (preserves /etc/hosts behavior)
    dns.lookup(hostname, lookupOptions, (lookupErr, address, lookupFamily) => {
      if (!lookupErr) {
        sendResponse(address, lookupFamily);
        return;
      }

      // ENOTFOUND or EAI_NONAME will try fallback, otherwise return error here
      if (!FALLBACK_CODES.has(lookupErr.code)) {
        callback(lookupErr);
        return;
      }

      const finalize = (addresses, resolvedFamily) => {
        // Finalize the resolution and call the callback
        if (!addresses || addresses.length === 0) {
          const err = new Error(`No addresses found for hostname: ${hostname}`);
          err.code = "ENOTFOUND";
          callback(err);
          return;
        }

        logger.debug("DNS fallback to c-ares resolver succeeded for %s", hostname);

        sendResponse(addresses, resolvedFamily);
      };

      const resolveOnce = (fn, resolvedFamily, onFail) => {
        // attempt resolution with a specific resolver
        fn(hostname, (err, addresses) => {
          if (!err) {
            finalize(addresses, resolvedFamily);
            return;
          }
          onFail(err);
        });
      };

      const handleFallbackFailure = (resolveErr) => {
        // handle final fallback failure with full context
        logger.debug(
          "DNS fallback failed for %s: lookup error=%s, resolve error=%s",
          hostname,
          lookupErr.code,
          resolveErr?.code,
        );
        callback(resolveErr || lookupErr);
      };

      // Fallback to c-ares (dns.resolve*). If family isn't specified, try v4 then v6.
      if (family === 6) {
        resolveOnce(dns.resolve6, 6, handleFallbackFailure);
        return;
      }

      if (family === 4) {
        resolveOnce(dns.resolve4, 4, handleFallbackFailure);
        return;
      }

      resolveOnce(dns.resolve4, 4, () => {
        resolveOnce(dns.resolve6, 6, handleFallbackFailure);
      });
    });
  };
}

export async function httpProxy(url, params = {}) {
  const constructedUrl = new URL(url);
  const disableIpv6 = process.env.HOMEPAGE_PROXY_DISABLE_IPV6 === "true";
  const agentOptions = {
    ...(disableIpv6 ? { family: 4, autoSelectFamily: false } : { autoSelectFamilyAttemptTimeout: 500 }),
    lookup: homepageDNSLookupFn(),
  };

  let request = null;
  if (constructedUrl.protocol === "https:") {
    request = httpsRequest(constructedUrl, {
      agent: new https.Agent({ ...agentOptions, rejectUnauthorized: false }),
      ...params,
    });
  } else {
    request = httpRequest(constructedUrl, {
      agent: new http.Agent(agentOptions),
      ...params,
    });
  }

  try {
    const [status, contentType, data, responseHeaders] = await request;
    return [status, contentType, data, responseHeaders, params];
  } catch (err) {
    const rawError = Array.isArray(err) ? err[1] : err;
    logger.error(
      "Error calling %s//%s%s%s...",
      constructedUrl.protocol,
      constructedUrl.hostname,
      constructedUrl.port ? `:${constructedUrl.port}` : "",
      constructedUrl.pathname,
    );
    if (err) logger.error(err);
    return [
      500,
      "application/json",
      {
        error: {
          message: rawError?.message ?? "Unknown error",
          url: sanitizeErrorURL(url),
          rawError,
        },
      },
      null,
    ];
  }
}
