import cachedFetch from "utils/cached-fetch";

export default async function handler(req, res) {
  const { lat, lon, apiKey, duration } = req.query;

  const api_url = `http://api.weatherapi.com/v1/current.json?q=${lat},${lon}&key=${apiKey}`;

  res.send(await cachedFetch(api_url, duration));
}
