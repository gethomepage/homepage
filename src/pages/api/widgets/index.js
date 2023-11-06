import { createAuthFromSettings } from "utils/auth/auth-helpers";
import { widgetsResponse } from "utils/config/api-response";

export default async function handler(req, res) {
  const auth = createAuthFromSettings(); 

  res.send(await widgetsResponse(auth.permissions(req)));
}
