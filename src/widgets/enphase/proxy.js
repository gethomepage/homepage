import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { asJson, formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const logger = createLogger("enphaseProxyHandler");

export default async function enphaseProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const widget = await getServiceWidget(group, service, index);

  const url = formatApiCall(widgets[widget.type].api, { ...widget });

  const headers = {};
  if (widget.token) {
    headers.Authorization = `Bearer ${widget.token}`;
  }

  const [status, contentType, data] = await httpProxy(url, { headers });

  if (status !== 200) {
    logger.debug("HTTP Error %d calling Envoy: %s", status, sanitizeErrorURL(new URL(url)));
    return res.status(status).json({
      error: {
        message: "HTTP Error",
        url: sanitizeErrorURL(new URL(url)),
        data: Buffer.isBuffer(data) ? Buffer.from(data).toString() : data,
      },
    });
  }

  const json = asJson(data);

  const production =
    json.production?.find((p) => p.type === "eim") ?? json.production?.find((p) => p.type === "inverters");
  const totalConsumption = json.consumption?.find((c) => c.measurementType === "total-consumption");
  const netConsumption = json.consumption?.find((c) => c.measurementType === "net-consumption");

  const producedToday = production?.whToday ?? 0;
  const consumedToday = totalConsumption?.whToday ?? null;

  // net-consumption whToday only measures grid import (never negative).
  // Exported energy must be calculated from produced - consumed.
  const importedToday = netConsumption != null ? (netConsumption.whToday ?? 0) : null;
  const exportedToday =
    consumedToday !== null ? Math.max(0, producedToday - consumedToday) : null;

  return res.status(200).json({
    wNow: production?.wNow ?? 0,
    whToday: producedToday,
    consumptionWhToday: consumedToday,
    importedToday,
    exportedToday,
  });
}
