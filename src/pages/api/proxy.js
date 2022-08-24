function pick(object, keys) {
  return;
}

export default async function handler(req, res) {
  const headers = ["X-API-Key", "Content-Type", "Authorization"].reduce((obj, key) => {
    if (req.headers && req.headers.hasOwnProperty(key.toLowerCase())) {
      obj[key] = req.headers[key.toLowerCase()];
    }
    return obj;
  }, {});

  try {
    const result = await fetch(req.query.url, {
      strictSSL: false,
      rejectUnhauthorized: false,
      method: req.method,
      headers: headers,
      body: req.method == "GET" || req.method == "HEAD" ? null : req.body,
    }).then((res) => res);

    const forward = await result.text();
    return res.status(result.status).send(forward);
  } catch {
    return res.status(500).send({
      error: "query failed",
    });
  }
}
