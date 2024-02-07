import { readAuthSettings } from "utils/auth/auth-helpers";
import { widgetsResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { provider } = readAuthSettings(getSettings().auth);
  res.send(await widgetsResponse(provider.authorize(req)));
}
