import { createAuthFromSettings } from "utils/auth/auth-helpers";
import { servicesResponse } from "utils/config/api-response";

export default async function handler(req, res) {
  const auth = createAuthFromSettings()

  res.send(await servicesResponse(auth.permissions(req)));
}
