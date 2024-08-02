import { readAuthSettings } from "utils/identity/identity-helpers";
import { servicesResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { provider, groups } = readIdentitySettings(getSettings().identity);
  res.send(await servicesResponse(provider.getIdentity(req), groups));
}
