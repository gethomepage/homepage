import yaml from "js-yaml";
import path from "path";
import { promises as fs } from "fs";
import checkAndCopyConfig from "utils/config";

export default async function getDockerArguments(server) {
  checkAndCopyConfig("docker.yaml");

  const configFile = path.join(process.cwd(), "config", "docker.yaml");
  const configData = await fs.readFile(configFile, "utf8");
  const servers = yaml.load(configData);

  if (!server) {
    if (process.platform !== "win32" && process.platform !== "darwin") {
      return { socketPath: "/var/run/docker.sock" };
    } else {
      return { host: "127.0.0.1" };
    }
  } else if (servers[server]) {
    if (servers[server].socket) {
      return { socketPath: servers[server].socket };
    } else if (servers[server].host) {
      return { host: servers[server].host, port: servers[server].port || null };
    } else {
      return servers[server];
    }
  } else {
    return null;
  }
}
