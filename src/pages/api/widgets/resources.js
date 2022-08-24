import { cpu, drive, mem, netstat } from "node-os-utils";

export default async function handler(req, res) {
  const { disk } = req.query;

  res.send({
    cpu: {
      usage: await cpu.usage(),
      load: cpu.loadavgTime(5),
    },
    drive: await drive.info(disk || "/"),
    memory: await mem.info(),
  });
}
