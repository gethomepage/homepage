/* eslint-disable no-param-reassign */
import { Cookie, CookieJar } from "tough-cookie";

const cookieJar = new CookieJar();

export function setCookieHeader(url, params) {
  // add cookie header, if we have one in the jar
  const existingCookie = cookieJar.getCookieStringSync(url.toString());
  if (existingCookie) {
    params.headers = params.headers ?? {};
    params.headers.Cookie = existingCookie;
  }
}

export function addCookieToJar(url, headers) {
  let cookieHeader = headers["set-cookie"];
  if (headers instanceof Headers) {
    cookieHeader = headers.get("set-cookie");
  }

  if (!cookieHeader || cookieHeader.length === 0) return;

  let cookies = null;
  if (cookieHeader instanceof Array) {
    cookies = cookieHeader.map((c) => {
      const cookie = Cookie.parse(c);
      cookie.setMaxAge(60 * 60);
      return cookie;
    });
  } else {
    const cookie = Cookie.parse(cookieHeader);
    cookie.setMaxAge(60 * 60);
    cookies = [cookie];
  }

  for (let i = 0; i < cookies.length; i += 1) {
    cookieJar.setCookieSync(cookies[i], url.toString(), { ignoreError: true });
  }
}

export function importCookieHeader(url, cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (let i = 0; i < cookies.length; i += 1) {
        const [key, value] = cookies[i].trim().split('=');

        // If there's an existing cookie with a matching key for this url,
        // we want to update it. Otherwise, we add a new cookie
        let existingCookie;
        try {
            existingCookie = cookieJar.getCookiesSync(url).find(existing => existing.key === key);
        } catch (e) {
            console.debug(`Failed to get cookies for ${url}: ${e}`)
        }

        if (existingCookie) {
            existingCookie.value = value;
        } else {
            cookieJar.setCookieSync(new Cookie({
                key, value
            }), url.toString(), { ignoreError: true });
        }
    }
}
