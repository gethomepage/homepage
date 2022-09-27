import { formatApiCall } from "utils/proxy/api-helpers";
import { addCookieToJar, setCookieHeader } from "utils/proxy/cookie-jar";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";

async function login(widget, params) {
  console.log("Doing login");
  const loginUrl = new URL(`${widget.url}/api/v2/auth/login`).toString();
  const loginBody = `username=${encodeURI(widget.username)}&password=${encodeURI(widget.password)}`;

  // using fetch intentionally, for login only, as the httpProxy method causes qBittorrent to
  // complain about header encoding
  return fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: loginBody,
  })
    .then(async (response) => {
      addCookieToJar(loginUrl, response.headers);
      setCookieHeader(loginUrl, params);
      const data = await response.text();
      return [response.status, data];
    })
    .catch((err) => [500, err]);
}

export default async function qbittorrentProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service);

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall("{url}/api/v2/{endpoint}", { endpoint, ...widget }));
  const params = { method: "GET", headers: {} };

  setCookieHeader(url, params);

  if (!params.headers.Cookie) {
    const [status, data] = await login(widget, params);

    if (status !== 200) {
      return res.status(status).end(data);
    }

    if (data.toString() !== "Ok.") {
      return res.status(401).end(data);
    }
  }

  const [status, contentType, data] = await httpProxy(url, params);

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
