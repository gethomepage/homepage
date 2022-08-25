import https from "https";
import getRawBody from "raw-body";

import { httpRequest, httpsRequest } from "utils/http";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const headers = ["X-API-Key", "Authorization"].reduce((obj, key) => {
    if (req.headers && req.headers.hasOwnProperty(key.toLowerCase())) {
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

    const [status, data] = await httpsRequest({
      hostname: url.hostname,
      path: url.pathname,
      port: url.port,
      agent: httpsAgent,
      method: req.method,
      headers: headers,
      body:
        req.method == "GET" || req.method == "HEAD"
          ? null
          : await getRawBody(req, {
              encoding: "utf8",
            }),
    });

    return res.status(status).send(data);
  } else {
    const [status, data] = await httpRequest({
      hostname: url.hostname,
      path: url.pathname,
      port: url.port,
      method: req.method,
      headers: headers,
      body:
        req.method == "GET" || req.method == "HEAD"
          ? null
          : await getRawBody(req, {
              encoding: "utf8",
            }),
    });

    return res.status(status).send(data);
  }
}
