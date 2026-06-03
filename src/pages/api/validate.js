import checkAndCopyConfig from "utils/config/config";
import createLogger from "utils/logger";

const configs = ["docker.yaml", "settings.yaml", "services.yaml", "bookmarks.yaml", "kubernetes.yaml", "proxmox.yaml"];
const logger = createLogger("configValidationHandler");

export default async function handler(req, res) {
  let errors = configs.map((config) => checkAndCopyConfig(config)).filter((status) => status !== true);
  if (errors.length > 0) {
    logger.error("Configuration validation errors", errors);
    errors = errors.map((error) => ({
      name: error.name,
      config: error.config,
      reason: error.reason,
      mark: { line: error.mark?.line },
    }));
  }
  res.send(errors);
}
