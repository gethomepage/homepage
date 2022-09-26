import https from "https";

import getRawBody from "raw-body";

import { httpRequest, httpsRequest } from "utils/proxy/http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const headers = ["X-API-Key", "Authorization"].reduce((obj, key) => {
    if (req.headers && Object.prototype.hasOwnProperty.call(req.headers, key.toLowerCase())) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = req.headers[key.toLowerCase()];
    }
    return obj;
  }, {});

  const url = new URL(req.query.url);

  if (url.protocol === "https:") {
    // this agent allows us to bypass the certificate check
    // which is required for most self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const [status, contentType, data] = await httpsRequest(url, {
      agent: httpsAgent,
      method: req.method,
      headers,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? null
          : await getRawBody(req, {
              encoding: "utf8",
            }),
    });

    res.setHeader("Content-Type", contentType);
    return res.status(status).send(data);
  }
  const [status, contentType, data] = await httpRequest(url, {
    method: req.method,
    headers,
    body:
      req.method === "GET" || req.method === "HEAD"
        ? null
        : await getRawBody(req, {
            encoding: "utf8",
          }),
  });

  res.setHeader("Content-Type", contentType);
  return res.status(status).send(data);
}
