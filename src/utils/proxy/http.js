/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-param-reassign */
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
      params.headers['content-length'] = Buffer.byteLength(params.body);
    }

    const request = requestor.request(url, params, (response) => {
      const data = [];

      response.on("data", (chunk) => {
        data.push(chunk);
      });

      response.on("end", () => {
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
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    request = httpsRequest(constructedUrl, {
      agent: httpsAgent,
      ...params,
    });
  } else {
    request = httpRequest(constructedUrl, params);
  }

  try {
    const [status, contentType, data, responseHeaders] = await request;
    return [status, contentType, data, responseHeaders];
  }
  catch (err) {
    logger.error(
      "Error calling %s//%s:%s%s...",
      constructedUrl.protocol,
      constructedUrl.hostname,
      constructedUrl.port,
      constructedUrl.pathname
    );
    logger.error(err);
    return [500, "application/json", { error: {message: err?.message ?? "Unknown error", url, rawError: err} }, null];
  }
}
