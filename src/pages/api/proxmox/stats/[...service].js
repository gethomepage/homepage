import { getProxmoxConfig } from "utils/config/proxmox";
import { httpProxy } from "utils/proxy/http";
import createLogger from "utils/logger";

const logger = createLogger("proxmoxStatsService");

export default async function handler(req, res) {
  const { service, type: vmType } = req.query;

  const [node, vmid] = service;

  if (!node) {
    return res.status(400).send({
      error: "proxmox node parameter is required",
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
      Authorization: `PVEAPIToken=${proxmoxConfig.username}=${proxmoxConfig.password}`,
    };

    const statusUrl = `${baseUrl}/nodes/${node}/${vmType}/${vmid}/status/current`;

    const [status, , data] = await httpProxy(statusUrl, {
      method: "GET",
      headers,
    });

    if (status !== 200) {
      logger.error("HTTP Error %d calling Proxmox API", status);
      return res.status(status).send({
        error: `Failed to fetch Proxmox ${vmType} status`
      });
    }



    // Parse the Buffer response as JSON
    let parsedData = JSON.parse(Buffer.from(data).toString());

    if (!parsedData || !parsedData.data) {
      return res.status(500).send({
        error: "Invalid response from Proxmox API",
      });
    }

    const responseData_ = parsedData.data;

    return res.status(200).json({
      status: responseData_.status || "unknown",
      cpu: responseData_.cpu,
      mem: responseData_.mem
    });
  } catch (error) {
    logger.error("Error fetching Proxmox status:", error);
    return res.status(500).send({
      error: "Failed to fetch Proxmox status",
    });
  }
}
