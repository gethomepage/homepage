import { getPrivateWidgetOptions } from "utils/config/widget-helpers";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("proxmox");

function calcRunning(total, current) {
  return current.status === "running" ? total + 1 : total;
}

export default async function handler(req, res) {
  const { index, node } = req.query;

  const privateWidgetOptions = await getPrivateWidgetOptions("proxmox", index);
  const url = privateWidgetOptions?.url;

  if (!url) {
    logger.error("Missing Proxmox URL");
    return res.status(400).json({ error: "Missing Proxmox URL" });
  }

  const apiUrl = `${url}/api2/json/cluster/resources`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `PVEAPIToken=${privateWidgetOptions.username}=${privateWidgetOptions.password}`,
  };

  try {
    const [status, , data] = await httpProxy(apiUrl, { method: "GET", headers });

    if (status !== 200) {
      const errorMessage = `HTTP ${status} getting data from Proxmox API. Data: ${data.toString()}`;
      logger.error(errorMessage);
      return res.status(400).json({ error: errorMessage });
    }

    const { data: clusterResources } = JSON.parse(Buffer.from(data).toString());

    const vms =
      clusterResources.filter((item) => item.type === "qemu" && item.template === 0 && (!node || node === item.node)) ||
      [];
    const lxc =
      clusterResources.filter((item) => item.type === "lxc" && item.template === 0 && (!node || node === item.node)) ||
      [];
    const nodes =
      clusterResources.filter(
        (item) => item.type === "node" && item.status === "online" && (!node || node === item.node),
      ) || [];

    const runningVMs = vms.reduce(calcRunning, 0);
    const runningLXC = lxc.reduce(calcRunning, 0);

    const maxMemory = nodes.reduce((sum, n) => n.maxmem + sum, 0);
    const usedMemory = nodes.reduce((sum, n) => n.mem + sum, 0);
    const maxCpu = nodes.reduce((sum, n) => n.maxcpu + sum, 0);
    const usedCpu = nodes.reduce((sum, n) => n.cpu * n.maxcpu + sum, 0);

    return res.status(200).json({
      vms: { running: runningVMs, total: vms.length },
      lxc: { running: runningLXC, total: lxc.length },
      cpu: { percent: maxCpu > 0 ? (usedCpu / maxCpu) * 100 : 0 },
      memory: { percent: maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0 },
    });
  } catch (e) {
    logger.error(e);
    return res.status(400).json({ error: e.message });
  }
}
