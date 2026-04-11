import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const proxyName = "awsCostExplorerProxyHandler";
const logger = createLogger(proxyName);

/**
 * Return { start, end } for the current calendar month.
 * End is always one day after today so Start < End holds even on the 1st.
 * @returns {{ start: string, end: string }}
 */
function currentMonthRange() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  const pad = (n) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month + 1)}-01`;
  // End is exclusive in the AWS API; use tomorrow in UTC to ensure start < end.
  const endDate = new Date(Date.UTC(year, month, day + 1));
  const end = `${endDate.getUTCFullYear()}-${pad(endDate.getUTCMonth() + 1)}-${pad(endDate.getUTCDate())}`;
  return { start, end };
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
