import path from "path";
import { readFileSync } from "fs";

import yaml from "js-yaml";

import checkAndCopyConfig, { CONF_DIR, substituteEnvironmentVars } from "utils/config/config";

export default function getNomadArguments(server) {
  checkAndCopyConfig("nomad.yaml");

  const configFile = path.join(CONF_DIR, "nomad.yaml");
  const rawConfigData = readFileSync(configFile, "utf8");
  const configData = substituteEnvironmentVars(rawConfigData);
  const servers = yaml.load(configData);

  if (!server) {
    return { endpoint: "http://127.0.0.1:4646/v1" };
  }

  if (servers[server]) {
    return servers[server];
  }

  return null;
}

export function parseServiceTags(tags) {
  if (!tags) {
    return {};
  }

  /* eslint-disable no-param-reassign */
  return tags.reduce((obj, tag) => {
    const [key, value] = tag.split("=");
    obj[key] = value;
    return obj;
  }, {});
  /* eslint-enable no-param-reassign */
}
