import cachedFetch from "utils/proxy/cached-fetch";
import { getSettings } from "utils/config";

export default async function handler(req, res) {
  const { latitude, longitude, units, provider, cache, lang } = req.query;
  let { apiKey } = req.query;

  if (!apiKey && !provider) {
    return res.status(400).json({ error: "Missing API key or provider" });
  }

  if (!apiKey && provider !== "openweathermap") {
    return res.status(400).json({ error: "Invalid provider for endpoint" });
  }

  if (!apiKey && provider) {
    const settings = getSettings();
    apiKey = settings?.providers?.openweathermap;
  }

  if (!apiKey) {
    return res.status(400).json({ error: "Missing API key" });
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}&lang=${lang}`;

  return res.send(await cachedFetch(apiUrl, cache));
}
