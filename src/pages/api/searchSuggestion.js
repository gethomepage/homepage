import { searchProviders } from "components/widgets/search/search";
import cachedFetch from "utils/proxy/cached-fetch";

export default async function handler(req, res) {
  const { query, providerName } = req.query;

  const provider = Object.values(searchProviders).find(({ name }) => name === providerName);
  
  if (!provider.suggestionUrl) {
    return res.json([query, []]); // Responde with the same array format but with no suggestions.
  }

  return res.send(await cachedFetch(`${provider.suggestionUrl}${query}`, 5));
}
