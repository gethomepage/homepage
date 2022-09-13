/* eslint-disable prefer-promise-reject-errors */
import https from "https";
import http from "http";

export function httpsRequest(url, params) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, params, (response) => {
      const data = [];

      response.on("data", (chunk) => {
        data.push(chunk);
      });

      response.on("end", () => {
        resolve([response.statusCode, response.headers["content-type"], Buffer.concat(data), response.headers]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    if (params.body) {
      request.write(params.body);
    }

    request.end();
  });
}

export function httpRequest(url, params) {
  return new Promise((resolve, reject) => {
    const request = http.request(url, params, (response) => {
      const data = [];

      response.on("data", (chunk) => {
        data.push(chunk);
      });

      response.on("end", () => {
        resolve([response.statusCode, response.headers["content-type"], Buffer.concat(data), response.headers]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    if (params.body) {
      request.write(params.body);
    }

    request.end();
  });
}

export function httpProxy(url, params = {}) {
  const constructedUrl = new URL(url);

  if (constructedUrl.protocol === "https:") {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    return httpsRequest(constructedUrl, {
      agent: httpsAgent,
      ...params,
    });
  }
  return httpRequest(constructedUrl, params);
}
