import createLogger from "utils/logger";
import { readFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { CONF_DIR, checkAndCopyConfig, substituteEnvironmentVars } from "utils/config/config";

const logger = createLogger("proxy");

export default async function handler(req, res) {
  const { service, path: servicePath } = req.query;

  if (!service || !servicePath) {
    return res.status(400).json({ error: "service and path are required" });
  }

  // Load services config to find target URL
  checkAndCopyConfig("services.yaml");
  const servicesFile = path.join(CONF_DIR, "services.yaml");
  const rawData = readFileSync(servicesFile, "utf8");
  const servicesData = substituteEnvironmentVars(rawData);
  const servicesConfig = yaml.load(servicesData);

  // Find the service with API key for auto-login
  const targetService = servicesConfig
    ?.filter((group) => group.widgets || group.services)
    .flatMap((group) => group.widgets || group.services)
    .find((svc) => svc.name?.toLowerCase() === service[0]?.toLowerCase());

  if (!targetService) {
    return res.status(404).json({ error: "Service not found" });
  }

  const targetUrl = new URL(targetService.href);
  const proxyUrl = `${targetUrl.origin}/${servicePath.join("/")}`;

  try {
    const response = await fetch(proxyUrl, {
      headers: {
        ...(targetService.apikey && { "X-Api-Key": targetService.apikey }),
      },
    });

    // Strip CSP and X-Frame-Options headers
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "content-security-policy" &&
        lowerKey !== "x-frame-options" &&
        lowerKey !== "frame-ancestors"
      ) {
        headers.set(key, value);
      }
    });

    const body = await response.text();
    const modifiedBody = body
      // Replace absolute URLs with proxied URLs
      .replace(new RegExp(targetUrl.origin, "g"), `/api/proxy/${service[0]}`)
      // Inject auto-login API key into responses for *arr apps
      .replace(
        /(<api-key>)(.*?)(<\/api-key>)/g,
        targetService.apikey ? `$1${targetService.apikey}$3` : "$1$3"
      );

    res.setHeaders(Object.fromEntries(headers.entries()));
    return res.status(200).send(modifiedBody);
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: e?.message ?? "Proxy request failed" });
  }
}