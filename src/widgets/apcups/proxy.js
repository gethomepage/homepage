import { Buffer } from "node:buffer";
import net from "node:net";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";

const logger = createLogger("apcupsProxyHandler");

function parseResponse(buffer) {
  let ptr = 0;
  const output = [];
  while (ptr < buffer.length) {
    const lineLen = buffer.readUInt16BE(ptr);
    const asciiData = buffer.toString("ascii", ptr + 2, lineLen + ptr + 2);
    output.push(asciiData);
    ptr += 2 + lineLen;
  }

  return output;
}

function statusAsJSON(statusOutput) {
  return statusOutput?.reduce((output, line) => {
    if (!line || line.startsWith("END APC")) return output;
    const [key, value] = line.trim().split(":");
    const newOutput = { ...output };
    newOutput[key.trim()] = value?.trim();
    return newOutput;
  }, {});
}

async function getStatus(host = "127.0.0.1", port = 3551) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.connect({ host, port });

    const response = [];

    socket.on("connect", () => {
      const CMD = "status";
      logger.debug(`Connecting to ${host}:${port}`);
      const buffer = Buffer.alloc(CMD.length + 2);
      buffer.writeUInt16BE(CMD.length, 0);
      buffer.write(CMD, 2);
      socket.write(buffer);
    });

    socket.on("data", (data) => {
      response.push(data);

      if (data.readUInt16BE(data.length - 2) === 0) {
        try {
          const buffer = Buffer.concat(response);
          const output = parseResponse(buffer);
          resolve(output);
        } catch (e) {
          reject(e);
        }
        socket.end();
      }
    });

    socket.on("error", (err) => {
      socket.destroy();
      reject(err);
    });
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("socket timeout"));
    });
    socket.on("end", () => {
      logger.debug("socket end");
    });
    socket.on("close", () => {
      logger.debug("socket closed");
    });
  });
}

export default async function apcupsProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(widget.url);
  const data = {};

  try {
    const statusData = await getStatus(url.hostname, url.port);
    const jsonData = statusAsJSON(statusData);

    data.status = jsonData.STATUS;
    data.load = jsonData.LOADPCT;
    data.bcharge = jsonData.BCHARGE;
    data.timeleft = jsonData.TIMELEFT;
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: e.message });
  }

  return res.status(200).send(data);
}
