import { existsSync } from "fs";

import createLogger from "utils/logger";

const logger = createLogger("resources");

const si = require("systeminformation");

export default async function handler(req, res) {
  const { type, target } = req.query;
  let { interfaceName } = req.query;

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
    if (!existsSync(target)) {
      return res.status(404).json({
        error: "Target not found",
      });
    }

    const fsSize = await si.fsSize();
    logger.debug("fsSize:", JSON.stringify(fsSize));
    return res.status(200).json({
      drive: fsSize.find((fs) => fs.mount === target) ?? fsSize.find((fs) => fs.mount === "/"),
    });
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

  if (type === "network"){
    let networkData = await si.networkStats();
    if(interfaceName !== "default" && interfaceName !== undefined && interfaceName !== "false"){
      networkData = networkData.filter((network) => network.iface === interfaceName)['0'];
      if(!networkData){
        return res.status(404).json({
          error: "Interface not found",
        });
      }
    }else{
      const interfaceDefault = await si.networkInterfaceDefault();
      interfaceName = interfaceDefault
      networkData = networkData.filter((network) => network.iface === interfaceDefault)['0'];
      if(!networkData){
        return res.status(404).json({
          error: "Interface not found! Please specify a valid interface name.",
        });
      }
    }
    return res.status(200).json({
      network: networkData,
      interface: interfaceName
    });
  }

  return res.status(400).json({
    error: "invalid type",
  });
}
