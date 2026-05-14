import Docker from "dockerode";

import getDockerArguments from "utils/config/docker";
import createLogger from "utils/logger";

const logger = createLogger("dockerLogs");

export default async function handler(req, res) {
  const { name } = req.query;

  if (!name || name.length === 0) {
    return res.status(400).json({ error: "Container name is required" });
  }

  const containerName = name[0];
  const containerServer = name[1];

  // Parse query params
  const { lines = "100", stream = "false" } = req.query;
  const lineCount = parseInt(lines, 10);
  const shouldStream = stream === "true";

  try {
    const dockerArgs = getDockerArguments(containerServer);
    const docker = new Docker(dockerArgs.conn);

    const containers = await docker.listContainers({ all: true });
    const containerNames = containers.flatMap((c) => c.Names.map((n) => n.replace(/^\//, "")));

    if (!containerNames.includes(containerName)) {
      return res.status(404).json({ error: "Container not found" });
    }

    const container = docker.getContainer(containerName);

    if (shouldStream) {
      // SSE streaming mode
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        tail: lineCount,
        timestamps: true,
      });

      stream.on("data", (chunk) => {
        // Docker logs have an 8-byte header per line, strip it
        const lines = chunk.toString("utf8").split("\n").filter(Boolean);
        for (const line of lines) {
          // Skip docker header bytes (8-byte header)
          let cleanLine = line;
          if (line.length > 8) {
            cleanLine = line.substring(8);
          }
          res.write(`data: ${cleanLine}\n\n`);
        }
      });

      stream.on("error", (err) => {
        logger.error(err);
        res.write(`data: [error] ${err.message}\n\n`);
        res.end();
      });

      stream.on("end", () => {
        res.end();
      });

      req.on("close", () => {
        stream.destroy();
      });
    } else {
      // Non-streaming mode: fetch last N lines
      const logs = await container.logs({
        follow: false,
        stdout: true,
        stderr: true,
        tail: lineCount,
        timestamps: true,
      });

      // Docker logs have 8-byte header per line, strip it
      const logString = logs.toString("utf8");
      const lines = logString.split("\n").filter(Boolean).map((line) => {
        if (line.length > 8) {
          return line.substring(8);
        }
        return line;
      });

      return res.status(200).json({
        container: containerName,
        lines,
        count: lines.length,
      });
    }
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: e?.message ?? "Failed to fetch logs" });
  }
}