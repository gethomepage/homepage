import { CoreV1Api } from "@kubernetes/client-node";

import { getKubeConfig } from "../config/kubernetes";
import createLogger from "../logger";

const logger = createLogger("configmap");
const kc = getKubeConfig();

export default async function getConfigMapPropertyValue(namespace, name, property) {
  try {
    const core = kc.makeApiClient(CoreV1Api);
    const configMap = await core.readNamespacedConfigMap({ name, namespace });
    const result = configMap?.data[property];
    if (!result) {
      logger.warning(
        "unable to find configMap property '%s' in configMap '%s' in namespace '%s'",
        property,
        name,
        namespace,
      );
    }
    return result;
  } catch (e) {
    logger.error("error getting secret '%s' in namespace '%s': %s", name, namespace, e);
  }
  return null;
}
