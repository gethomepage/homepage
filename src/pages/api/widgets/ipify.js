import { cachedRequest } from "utils/proxy/http";

export default async function handler(req, res) {
  const { ipv6, cache } = req.query;
  const url = ipv6 ? `https://api6.ipify.org?format=json` : `https://api.ipify.org?format=json`;
  return res.send(await cachedRequest(url, cache || 360));
}
