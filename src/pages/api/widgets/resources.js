import { existsSync } from "fs";

const si = require('systeminformation');

export default async function handler(req, res) {
  const { type, target } = req.query;

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

    return res.status(200).json({
      drive: fsSize.find(fs => fs.mount === target) ?? fsSize.find(fs => fs.mount === "/")
    });
  }

  if (type === "memory") {
    return res.status(200).json({
      memory: await si.mem(),
    });
  }

  if (type === "cputemp") {
    return res.status(200).json({
      cputemp: await si.cpuTemperature(),
    });
  }

  if (type === "uptime") {
    const timeData = await si.time();
    return res.status(200).json({
      uptime: timeData.uptime
    });
  }

  return res.status(400).json({
    error: "invalid type",
  });
}
