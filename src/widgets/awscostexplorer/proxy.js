import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "awsCostExplorerProxyHandler";
const logger = createLogger(proxyName);

/**
 * Format a Date as YYYY-MM-DD (required by the Cost Explorer API).
 * @param {Date} date
 * @returns {string}
 */
function toISODateString(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Return { start, end } for the current calendar month.
 * End is always one day after today so Start < End holds even on the 1st.
 * @returns {{ start: string, end: string }}
 */
function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  // End is exclusive in the AWS API; use tomorrow to ensure start < end.
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start: toISODateString(start), end: toISODateString(end) };
}

export default async function awsCostExplorerProxyHandler(req, res) {
  const { group, service, index } = req.query;
  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const { accessKeyId, secretAccessKey, region = "us-east-1" } = widget;

  if (!accessKeyId || !secretAccessKey) {
    return res.status(400).json({ error: "AWS credentials (accessKeyId and secretAccessKey) are required" });
  }

  const client = new CostExplorerClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  const { start, end } = currentMonthRange();

  try {
    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: start, End: end },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
    });

    const response = await client.send(command);
    const costResult = response?.ResultsByTime?.[0]?.Total?.UnblendedCost;

    if (!costResult) {
      logger.error("Unexpected response shape from AWS Cost Explorer API");
      return res.status(500).json({ error: "Unexpected response shape from AWS Cost Explorer API" });
    }

    return res.status(200).json({ amount: costResult.Amount, unit: costResult.Unit });
  } catch (e) {
    logger.error("Error calling AWS Cost Explorer: %s", e.message);
    return res.status(500).json({ error: e.message });
  }
}
