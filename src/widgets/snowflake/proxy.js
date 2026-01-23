import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "snowflakeProxyHandler";
const logger = createLogger(proxyName);

function parsePrometheusMetrics(text) {
  const metrics = {
    connections_total: 0,
    connection_timeouts_total: 0,
    traffic_inbound_bytes: 0,
    traffic_outbound_bytes: 0,
    connections_by_country: {},
  };

  const lines = text.split("\n");

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    // Match: tor_snowflake_proxy_connections_total{cc="IR"} 10
    const connectionMatch = trimmedLine.match(/^tor_snowflake_proxy_connections_total(?:\{cc="([^"]+)"\})?\s+(\d+)/);
    if (connectionMatch) {
      const country = connectionMatch[1];
      const value = parseInt(connectionMatch[2], 10);
      if (country) {
        metrics.connections_by_country[country] = value;
      }
      metrics.connections_total += value;
      return;
    }

    // Match: tor_snowflake_proxy_connection_timeouts_total 5
    const timeoutMatch = trimmedLine.match(/^tor_snowflake_proxy_connection_timeouts_total\s+(\d+)/);
    if (timeoutMatch) {
      metrics.connection_timeouts_total = parseInt(timeoutMatch[1], 10);
      return;
    }

    // Match: tor_snowflake_proxy_traffic_inbound_bytes_total 1234567890
    const inboundMatch = trimmedLine.match(/^tor_snowflake_proxy_traffic_inbound_bytes_total\s+(\d+)/);
    if (inboundMatch) {
      metrics.traffic_inbound_bytes = parseInt(inboundMatch[1], 10);
      return;
    }

    // Match: tor_snowflake_proxy_traffic_outbound_bytes_total 987654321
    const outboundMatch = trimmedLine.match(/^tor_snowflake_proxy_traffic_outbound_bytes_total\s+(\d+)/);
    if (outboundMatch) {
      metrics.traffic_outbound_bytes = parseInt(outboundMatch[1], 10);
    }
  });

  metrics.traffic_total_bytes = metrics.traffic_inbound_bytes + metrics.traffic_outbound_bytes;
  metrics.countries_served = Object.keys(metrics.connections_by_country).length;

  return metrics;
}

export default async function snowflakeProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.error("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.error("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid widget configuration" });
  }

  try {
    const url = formatApiCall(widgets[widget.type].api, { ...widget });
    logger.debug("Fetching Snowflake metrics from: %s", url);

    const [status, , data] = await httpProxy(url);

    if (status !== 200) {
      logger.error("Error fetching Snowflake metrics: HTTP %d", status);
      return res.status(status).json({ error: "Failed to fetch Snowflake metrics" });
    }

    const metricsText = Buffer.isBuffer(data) ? data.toString("utf-8") : data;
    const parsedMetrics = parsePrometheusMetrics(metricsText);

    logger.debug("Parsed Snowflake metrics: %o", parsedMetrics);
    return res.status(200).json(parsedMetrics);
  } catch (error) {
    logger.error("Exception fetching Snowflake metrics: %s", error.message);
    return res.status(500).json({ error: "Snowflake API Error", message: error.message });
  }
}
