import https from "https";

function httpsRequest(params) {
  return new Promise(function (resolve, reject) {
    var request = https.request(params, function (response) {
      let data = "";

      response.on("data", (chunk) => {
        data = data + chunk.toString();
      });

      response.on("end", () => {
        resolve([response.statusCode, data]);
      });
    });

    request.on("error", (error) => {
      reject([500, error]);
    });

    request.end();
  });
}

export default async function handler(req, res) {
  const headers = ["X-API-Key", "Content-Type", "Authorization"].reduce((obj, key) => {
    if (req.headers && req.headers.hasOwnProperty(key.toLowerCase())) {
      obj[key] = req.headers[key.toLowerCase()];
    }
    return obj;
  }, {});

  // this agent allows us to bypass the certificate check
  // which is required for most self-signed certificates
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const url = new URL(req.query.url);

  const [status, data] = await httpsRequest({
    hostname: url.hostname,
    path: url.pathname,
    port: url.port,
    agent: httpsAgent,
    method: req.method,
    headers: headers,
    body: req.method == "GET" || req.method == "HEAD" ? null : req.body,
  });

  res.status(status).send(data);
}
