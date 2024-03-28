import { searchProviders } from "components/widgets/search/search";
import cachedFetch from "utils/proxy/cached-fetch";
import { widgetsFromConfig } from "utils/config/widget-helpers";

export default async function handler(req, res) {
  const { query, providerName } = req.query;

  const provider = Object.values(searchProviders).find(({ name }) => name === providerName);

  if (provider.name === "Custom") {
    const widgets = await widgetsFromConfig();
    const searchWidget = widgets.find((w) => w.type === "search");

    provider.url = searchWidget.options.url;
    provider.suggestionUrl = searchWidget.options.suggestionUrl;
  }

  if (!provider.suggestionUrl) {
    return res.json([query, []]); // Responde with the same array format but with no suggestions.
  }

  return res.send(await cachedFetch(`${provider.suggestionUrl}${encodeURIComponent(query)}`, 5, "Mozilla/5.0"));
}
