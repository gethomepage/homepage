/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-param-reassign */
import { http, https } from "follow-redirects";
import { Cookie, CookieJar } from 'tough-cookie';

const cookieJar = new CookieJar();

function setCookieHeader(url, params) {
  // add cookie header, if we have one in the jar
  const existingCookie = cookieJar.getCookieStringSync(url.toString());
  if (existingCookie) {
    params.headers = params.headers ?? {};
    params.headers.Cookie = existingCookie;
  }
}

function addCookieHandler(url, params) {
  setCookieHeader(url, params);

  // handle cookies during redirects
  params.beforeRedirect = (options, responseInfo) => {
    const cookieHeader = responseInfo.headers['set-cookie'];
    if (!cookieHeader || cookieHeader.length === 0) return;

    let cookies = null;
    if (cookieHeader instanceof Array) {
      cookies = cookieHeader.map(Cookie.parse);
    }
    else {
      cookies = [Cookie.parse(cookieHeader)];
    }

    for (let i = 0; i < cookies.length; i += 1) {
      cookieJar.setCookieSync(cookies[i], options.href);
    }

    setCookieHeader(options.href, options);
  };
}

export function httpsRequest(url, params) {
  return new Promise((resolve, reject) => {
    addCookieHandler(url, params);
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
    addCookieHandler(url, params);
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
