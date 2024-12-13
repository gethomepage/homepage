import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { getPrivateWidgetOptions } from "utils/config/widget-helpers";

const logger = createLogger("peanut");

async function retrieveFromPeanutAPI(privateWidgetOptions, ups) {
  let errorMessage;
  const url = privateWidgetOptions?.options?.url;
  if (!url) {
    errorMessage = "Missing PeaNUT URL";
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  const apiUrl = `${url}/api/v1/devices/${ups || privateWidgetOptions?.options?.key}`;
  const headers = {
    "Accept-Encoding": "application/json",
  };
  const params = { method: "GET", headers };

  const [status, , data] = await httpProxy(apiUrl, params);

  if (status === 401) {
    errorMessage = `Authorization failure getting data from peanut API. Data: ${data.toString()}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (status !== 200) {
    errorMessage = `HTTP ${status} getting data from peanut API. Data: ${data.toString()}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return JSON.parse(Buffer.from(data).toString());
}

export default async function handler(req, res) {
  const { key } = req.query;

  const privateWidgets = await getPrivateWidgetOptions();
  const privateWidgetOptions = privateWidgets.find((o) => o.type === "peanut");

  try {
    const upsData = await retrieveFromPeanutAPI(privateWidgetOptions, key);
    const data = {
      ...upsData,
    };

    return res.status(200).send(data);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}
