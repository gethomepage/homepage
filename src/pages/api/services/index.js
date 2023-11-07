import { createAuthProvider } from "utils/auth/auth-helpers";
import { servicesResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";
import createLogger from "utils/logger";

let logger = createLogger("services_index")

export default async function handler(req, res) {
  logger.log("Call services");
  const auth = createAuthProvider(getSettings)
  const result = await servicesResponse(auth.permissions(req))
  logger.log(result); 
  res.send(result);
}
