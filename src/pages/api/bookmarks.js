import { readIdentitySettings } from "utils/identity/identity-helpers";
import { bookmarksResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { provider, groups } = readIdentitySettings(getSettings().identity);
  res.send(await bookmarksResponse(provider.getIdentity(req), groups));
}
