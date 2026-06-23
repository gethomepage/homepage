import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const logger = createLogger("ticktickProxyHandler");

export default async function ticktickProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (endpoint !== "task/completed") {
    return credentialedProxyHandler(req, res, map);
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget) return res.status(400).json({ error: "Invalid widget" });

  const now = new Date();
  const rangeDays = widget.completedLookbackDays ?? 90;
  const start = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 19) + ".000+0000";

  try {
    const response = await fetch("https://api.ticktick.com/open/v1/task/completed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${widget.key}`,
      },
      body: JSON.stringify({
        projectIds: [widget.projectId],
        startDate: fmt(start),
        endDate: fmt(now),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error("TickTick closedTasks HTTP %d", response.status);
      return res.status(response.status).json({ error: { message: "HTTP Error", status: response.status } });
    }

    const mapped = map ? map(Buffer.from(JSON.stringify(data))) : data;
    return res.status(200).json(mapped);
  } catch (err) {
    logger.error("TickTick closedTasks error: %s", err.message);
    return res.status(500).json({ error: { message: err.message } });
  }
}
