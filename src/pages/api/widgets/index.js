import { createAuthProvider } from "utils/auth/auth-helpers";
import { widgetsResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const auth = createAuthProvider(getSettings()); 

  res.send(await widgetsResponse(auth.permissions(req)));
}
