import cachedFetch from "utils/cached-fetch";

export default async function handler(req, res) {
  const { lat, lon, apiKey, duration } = req.query;

  const api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  res.send(await cachedFetch(api_url, duration));
}
