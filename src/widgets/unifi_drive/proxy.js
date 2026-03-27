import getServiceWidget from "utils/config/service-helpers";
import createUnifiProxyHandler from "utils/proxy/handlers/unifi";
import { httpProxy } from "utils/proxy/http";

const drivePrefix = "/proxy/drive";

async function getWidget(req, logger) {
  const { group, service, index } = req.query;
  if (!group || !service) return null;

  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }
  return widget;
}

async function resolveRequestContext({ cachedPrefix, widget }) {
  if (cachedPrefix !== null) {
    return { prefix: cachedPrefix };
  }

  const [, , , responseHeaders] = await httpProxy(widget.url);

  return {
    prefix: drivePrefix,
    csrfToken: responseHeaders?.["x-csrf-token"],
  };
}

export default createUnifiProxyHandler({
  proxyName: "unifiDriveProxyHandler",
  resolveWidget: getWidget,
  resolveRequestContext,
});
