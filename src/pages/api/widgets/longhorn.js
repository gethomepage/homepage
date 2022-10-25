import { httpProxy } from "../../../utils/proxy/http";
import createLogger from "../../../utils/logger";
import { getSettings } from "../../../utils/config/config";

const logger = createLogger("longhorn");

function parseLonghornData(data) {
  const json = JSON.parse(data);

  if (!json) {
    return null;
  }

  const nodes = json.data.map((node) => {
    let available = 0;
    let maximum = 0;
    let reserved = 0;
    let scheduled = 0;
    Object.keys(node.disks).forEach((diskKey) => {
      const disk = node.disks[diskKey];
      available += disk.storageAvailable;
      maximum += disk.storageMaximum;
      reserved += disk.storageReserved;
      scheduled += disk.storageScheduled;
    });
    return {
      id: node.id,
      available,
      maximum,
      reserved,
      scheduled,
    };
  });
  const total = nodes.reduce((summary, node) => ({
    available: summary.available + node.available,
    maximum: summary.maximum + node.maximum,
    reserved: summary.reserved + node.reserved,
    scheduled: summary.scheduled + node.scheduled,
  }));
  total.id = "total";
  nodes.push(total);
  return nodes;
}

export default async function handler(req, res) {
  const settings = getSettings();
  const longhornSettings = settings?.providers?.longhorn;
  const {url, username, password} = longhornSettings;

  if (!url) {
    const errorMessage = "Missing Longhorn URL";
    logger.error(errorMessage);
    return res.status(400).json({ error: errorMessage });
  }

  const apiUrl = `${url}/v1/nodes`;
  const headers = {
    "Accept-Encoding": "application/json"
  };
  if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
  }
  const params = { method: "GET", headers };

  const [status, contentType, data] = await httpProxy(apiUrl, params);

  if (status === 401) {
    logger.error("Authorization failure getting data from Longhorn API. Data: %s", data);
  }

  if (status !== 200) {
    logger.error("HTTP %d getting data from Longhorn API. Data: %s", status, data);
  }

  if (contentType) res.setHeader("Content-Type", contentType);

  const nodes = parseLonghornData(data);

  return res.status(200).json({
    nodes,
  });
}
