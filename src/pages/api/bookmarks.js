import { createAuthProvider } from "utils/auth/auth-helpers";
import { bookmarksResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const auth = createAuthProvider(getSettings()) 
  res.send(await bookmarksResponse(auth.permissions(req)));
}
