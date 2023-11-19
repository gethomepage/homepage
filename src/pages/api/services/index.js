import { readAuthSettings } from "utils/auth/auth-helpers";
import { servicesResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { provider, groups } = readAuthSettings(getSettings().auth)
  res.send(await servicesResponse(provider.permissions(req), groups));
}
