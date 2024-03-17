/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-param-reassign */
import { createUnzip, constants as zlibConstants } from "node:zlib";

import { http, https } from "follow-redirects";

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

export async function httpProxy(url, params = {}) {
  const constructedUrl = new URL(url);

  let request = null;
  if (constructedUrl.protocol === "https:") {
    request = httpsRequest(constructedUrl, {
      agent: new https.Agent({
        rejectUnauthorized: false,
        autoSelectFamily: true,
      }),
      ...params,
    });
  } else {
    request = httpRequest(constructedUrl, {
      agent: new http.Agent({
        autoSelectFamily: true,
      }),
      ...params,
    });
  }

  try {
    const [status, contentType, data, responseHeaders] = await request;
    return [status, contentType, data, responseHeaders, params];
  } catch (err) {
    logger.error(
      "Error calling %s//%s%s%s...",
      constructedUrl.protocol,
      constructedUrl.hostname,
      constructedUrl.port ? `:${constructedUrl.port}` : "",
      constructedUrl.pathname,
    );
    if (err) logger.error(err);
    return [500, "application/json", { error: { message: err?.message ?? "Unknown error", url, rawError: err } }, null];
  }
}
