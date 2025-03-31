import { readFileSync } from "fs";
import path from "path";

import yaml from "js-yaml";

import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";

export default function getDockerArguments(server) {
  checkAndCopyConfig("docker.yaml");

  const configFile = path.join(CONF_DIR, "docker.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  const servers = yaml.load(configData);

  if (!server) {
    if (process.platform !== "win32" && process.platform !== "darwin") {
      return { socketPath: "/var/run/docker.sock" };
    }

    return { host: "127.0.0.1" };
  }

  if (servers[server]) {
    if (servers[server].socket) {
      return { conn: { socketPath: servers[server].socket }, swarm: !!servers[server].swarm };
    }

    if (servers[server].host) {
      const res = {
        conn: { host: servers[server].host },
        swarm: !!servers[server].swarm,
      };

      if (servers[server].port) {
        res.conn.port = servers[server].port;
      }

      if (servers[server].tls) {
        res.conn.ca = readFileSync(path.join(CONF_DIR, servers[server].tls.caFile));
        res.conn.cert = readFileSync(path.join(CONF_DIR, servers[server].tls.certFile));
        res.conn.key = readFileSync(path.join(CONF_DIR, servers[server].tls.keyFile));
      }

      return res;
    }

    return servers[server];
  }
  return null;
}
