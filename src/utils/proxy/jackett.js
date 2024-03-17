import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";

export async function fetchJackettCookie(widget, loginURL) {
  const url = new URL(formatApiCall(loginURL, widget));
  const loginData = `password=${encodeURIComponent(widget.password)}`;
  const [status, , , , params] = await httpProxy(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: loginData,
  });

  if (status === 200 && params && params.headers && params.headers.Cookie) {
    const cookieValue = params.headers.Cookie;
    return cookieValue;
  } else {
    logger.error("Failed to fetch Jackett cookie, status: %d", status);
    return null;
  }
}
