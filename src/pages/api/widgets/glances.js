import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";
import { getPrivateWidgetOptions } from "utils/config/widget-helpers";

const logger = createLogger("glances");

async function retrieveFromGlancesAPI(privateWidgetOptions, endpoint) {
  let errorMessage;
  const url = privateWidgetOptions?.url;
  if (!url) {
    errorMessage = "Missing Glances URL";
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  const apiUrl = `${url}/api/${privateWidgetOptions.version}/${endpoint}`;
  const headers = {
    "Accept-Encoding": "application/json",
  };
  if (privateWidgetOptions.username && privateWidgetOptions.password) {
    headers.Authorization = `Basic ${Buffer.from(
      `${privateWidgetOptions.username}:${privateWidgetOptions.password}`,
    ).toString("base64")}`;
  }
  const params = { method: "GET", headers };

  const [status, , data] = await httpProxy(apiUrl, params);

  if (status === 401) {
    errorMessage = `Authorization failure getting data from glances API. Data: ${data.toString()}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (status !== 200) {
    errorMessage = `HTTP ${status} getting data from glances API. Data: ${data.toString()}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return JSON.parse(Buffer.from(data).toString());
}

export default async function handler(req, res) {
  const { index, cputemp: includeCpuTemp, uptime: includeUptime, disk: includeDisks, version } = req.query;

  const privateWidgetOptions = await getPrivateWidgetOptions("glances", index);
  privateWidgetOptions.version = version ?? 3;

  try {
    const cpuData = await retrieveFromGlancesAPI(privateWidgetOptions, "cpu");
    const loadData = await retrieveFromGlancesAPI(privateWidgetOptions, "load");
    const memoryData = await retrieveFromGlancesAPI(privateWidgetOptions, "mem");
    const data = {
      cpu: cpuData,
      load: loadData,
      mem: memoryData,
    };

    // Disabled by default, dont call unless needed
    if (includeUptime) {
      data.uptime = await retrieveFromGlancesAPI(privateWidgetOptions, "uptime");
    }

    if (includeCpuTemp) {
      data.sensors = await retrieveFromGlancesAPI(privateWidgetOptions, "sensors");
    }

    if (includeDisks) {
      data.fs = await retrieveFromGlancesAPI(privateWidgetOptions, "fs");
    }

    return res.status(200).send(data);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
}
