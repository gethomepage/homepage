import { CoreV1Api } from "@kubernetes/client-node";

import { getKubeConfig } from "../config/kubernetes";
import createLogger from "../logger";

const logger = createLogger("secret");
const kc = getKubeConfig();

export default async function getSecretPropertyValue(namespace, name, property) {
  try {
    const core = kc.makeApiClient(CoreV1Api);
    const secret = await core.readNamespacedSecret({ name, namespace });
    const buffer = secret?.data[property];
    if (buffer) {
      return Buffer.from(buffer, "base64").toString();
    }
    logger.warning("unable to find secret property '%s' in secret '%s' in namespace '%s'", property, name, namespace);
  } catch (e) {
    logger.error("error getting secret '%s' in namespace '%s': %s", name, namespace, e);
  }
  return null;
}
