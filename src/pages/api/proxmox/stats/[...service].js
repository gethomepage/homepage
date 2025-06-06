import { getProxmoxConfig } from "utils/config/proxmox";
import createLogger from "utils/logger";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("proxmoxStatsService");

export default async function handler(req, res) {
  const { service, type: vmType } = req.query;

  const [node, vmid] = service;

  if (!node) {
    return res.status(400).send({
      error: "Proxmox node parameter is required",
    });
  }

  try {
    const proxmoxConfig = getProxmoxConfig();

    if (!proxmoxConfig) {
      return res.status(500).send({
        error: "Proxmox server configuration not found",
      });
    }

    const baseUrl = `${proxmoxConfig.url}/api2/json`;
    const headers = {
      Authorization: `PVEAPIToken=${proxmoxConfig.token}=${proxmoxConfig.secret}`,
    };

    const statusUrl = `${baseUrl}/nodes/${node}/${vmType}/${vmid}/status/current`;

    const [status, , data] = await httpProxy(statusUrl, {
      method: "GET",
      headers,
    });

    if (status !== 200) {
      logger.error("HTTP Error %d calling Proxmox API", status);
      return res.status(status).send({
        error: `Failed to fetch Proxmox ${vmType} status`,
      });
    }

    let parsedData = JSON.parse(Buffer.from(data).toString());

    if (!parsedData || !parsedData.data) {
      return res.status(500).send({
        error: "Invalid response from Proxmox API",
      });
    }

    return res.status(200).json({
      status: parsedData.data.status || "unknown",
      cpu: parsedData.data.cpu,
      mem: parsedData.data.mem,
    });
  } catch (error) {
    logger.error("Error fetching Proxmox status:", error);
    return res.status(500).send({
      error: "Failed to fetch Proxmox status",
    });
  }
}
