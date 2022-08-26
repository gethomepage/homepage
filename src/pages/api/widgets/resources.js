import { cpu, drive, mem, netstat } from "node-os-utils";

export default async function handler(req, res) {
  const { type, target } = req.query;

  if (type == "cpu") {
    return res.status(200).json({
      cpu: {
        usage: await cpu.usage(1000),
        load: cpu.loadavgTime(5),
      },
    });
  } else if (type == "disk") {
    return res.status(200).json({
      drive: await drive.info(target || "/"),
    });
  } else if (type == "memory") {
    return res.status(200).json({
      memory: await mem.info(),
    });
  } else {
    return res.status(400).json({
      error: "invalid type",
    });
  }
}
