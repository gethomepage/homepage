import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { getPrivateWidgetOptions } from "utils/config/widget-helpers";

const logger = createLogger("truenas");

async function retrieveFromTruenasAPI(privateWidgetOptions, endpoint, method, body) {
  let errorMessage;
  const url = privateWidgetOptions?.url;
  if (!url) {
    errorMessage = "Missing Truenas URL";
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  const apiUrl = `${url}/api/v2.0/${endpoint}`;
  const headers = {
    "Accept-Encoding": "application/json",
  };
  if (privateWidgetOptions.username && privateWidgetOptions.password) {
    headers.Authorization = `Basic ${Buffer.from(
      `${privateWidgetOptions.username}:${privateWidgetOptions.password}`,
    ).toString("base64")}`;
  } else if (privateWidgetOptions.key) {
    headers.Authorization = `Bearer ${privateWidgetOptions.key}`;
  } else {
    errorMessage = "Missing TrueNAS credentials";
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  const params = { method, headers, body };

  const [status, , data] = await httpProxy(apiUrl, params);

  if (status === 401) {
    errorMessage = `Authorization failure getting data from TrueNAS API. Data: ${data.toString()}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (status !== 200) {
    errorMessage = `HTTP ${status} getting data from TrueNAS API. Data: ${data.toString()}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return JSON.parse(Buffer.from(data).toString());
}

export default async function handler(req, res) {
  const { index } = req.query;

  const privateWidgetOptions = await getPrivateWidgetOptions("truenas", index);

  try {
    const systemInfo = await retrieveFromTruenasAPI(privateWidgetOptions, "system/info");
    const memoryInfo = await retrieveFromTruenasAPI(
      privateWidgetOptions,
      "reporting/get_data",
      "POST",
      JSON.stringify({
        graphs: [{ name: "memory" }],
        reporting_query: {
          start: Math.round((new Date() - 30000) / 1000), // 30 seconds ago
          end: "NOW",
          aggregate: true,
        },
      }),
    );

    const [used, free, cached, buffered] = memoryInfo?.[0]?.aggregations?.mean || [];

    const data = {
      cpu: {
        load: systemInfo?.loadavg?.[0],
      },
      memory: {
        used,
        free,
        cached,
        buffered,
        total: used + free, // Using used + free instead of total memory to match TrueNAS dashboard
      },
    };

    return res.status(200).send(data);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}
