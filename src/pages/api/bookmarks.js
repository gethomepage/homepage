import { readAuthSettings } from "utils/identitiy/identity-helpers";
import { bookmarksResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { provider, groups } = readAuthSettings(getSettings().identity);
  res.send(await bookmarksResponse(provider.authorize(req), groups));
}
