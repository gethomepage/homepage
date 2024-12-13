import cachedFetch from "utils/proxy/cached-fetch";

export default async function handler(req, res) {
  const { latitude, longitude, units, cache, timezone } = req.query;
  const degrees = units === "metric" ? "celsius" : "fahrenheit";
  const timezeone = timezone ?? "auto";
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&current_weather=true&temperature_unit=${degrees}&timezone=${timezeone}`;
  return res.send(await cachedFetch(apiUrl, cache));
}
