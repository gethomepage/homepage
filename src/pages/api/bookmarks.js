import { readAuthSettings } from "utils/auth/auth-helpers";
import { bookmarksResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { provider, groups } = readAuthSettings(getSettings().auth);
  res.send(await bookmarksResponse(provider.authorize(req), groups));
}
