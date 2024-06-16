import cachedFetch from "utils/proxy/cached-fetch";
import { getSettings } from "utils/config/config";
import { getPrivateWidgetOptions } from "utils/config/widget-helpers";

export default async function handler(req, res) {
  const { latitude, longitude, provider, cache, lang, index } = req.query;
  const privateWidgetOptions = await getPrivateWidgetOptions("weatherapi", index);
  let { apiKey } = privateWidgetOptions;

  if (!apiKey && !provider) {
    return res.status(400).json({ error: "Missing API key or provider" });
  }

  if (!apiKey && provider !== "weatherapi") {
    return res.status(400).json({ error: "Invalid provider for endpoint" });
  }

  if (!apiKey && provider) {
    const settings = getSettings();
    apiKey = settings?.providers?.weatherapi;
  }

  if (!apiKey) {
    return res.status(400).json({ error: "Missing API key" });
  }

  const apiUrl = `http://api.weatherapi.com/v1/current.json?q=${latitude},${longitude}&key=${apiKey}&lang=${lang}`;

  return res.send(await cachedFetch(apiUrl, cache));
}
