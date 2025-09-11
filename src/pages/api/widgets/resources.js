import createLogger from "utils/logger";

const logger = createLogger("resources");

const si = require("systeminformation");

export default async function handler(req, res) {
  const { type, target, interfaceName = "default" } = req.query;

  if (type === "cpu") {
    const load = await si.currentLoad();
    return res.status(200).json({
      cpu: {
        usage: load.currentLoad,
        load: load.avgLoad,
      },
    });
  }

  if (type === "disk") {
    const requested = typeof target === "string" && target ? target : "/";
    const fsSize = await si.fsSize();
    logger.debug("fsSize:", JSON.stringify(fsSize));

    const drive = fsSize.find((fs) => {
      return fs.mount === requested;
    });

    if (!drive) {
      logger.warn(`Drive not found for target: ${requested}`);
      return res.status(404).json({ error: "Resource not available." });
    }

    return res.status(200).json({ drive });
  }

  if (type === "memory") {
    const memory = await si.mem();
    logger.debug("memory:", JSON.stringify(memory));
    return res.status(200).json({
      memory,
    });
  }

  if (type === "cputemp") {
    const cputemp = await si.cpuTemperature();
    logger.debug("cputemp:", JSON.stringify(cputemp));
    return res.status(200).json({
      cputemp,
    });
  }

  if (type === "uptime") {
    const timeData = await si.time();
    logger.debug("timeData:", JSON.stringify(timeData));
    return res.status(200).json({
      uptime: timeData.uptime,
    });
  }

  if (type === "network") {
    let networkData = await si.networkStats();
    let interfaceDefault;
    logger.debug("networkData:", JSON.stringify(networkData));
    if (interfaceName && interfaceName !== "default") {
      networkData = networkData.filter((network) => network.iface === interfaceName).at(0);
      if (!networkData) {
        return res.status(404).json({
          error: "Interface not found",
        });
      }
    } else {
      interfaceDefault = await si.networkInterfaceDefault();
      networkData = networkData.filter((network) => network.iface === interfaceDefault).at(0);
      if (!networkData) {
        return res.status(404).json({
          error: "Default interface not found",
        });
      }
    }
    return res.status(200).json({
      network: networkData,
      interface: interfaceName !== "default" ? interfaceName : interfaceDefault,
    });
  }

  return res.status(400).json({
    error: "invalid type",
  });
}
