import { createAuthFromSettings } from "utils/auth/auth-helpers";
import { bookmarksResponse } from "utils/config/api-response";

export default async function handler(req, res) {
  const auth = createAuthFromSettings() 
  res.send(await bookmarksResponse(auth.permissions(req)));
}
