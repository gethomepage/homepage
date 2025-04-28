import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

import checkAndCopyConfig, { CONF_DIR } from "utils/config/config";

const configs = [
  "docker.yaml",
  "settings.yaml",
  "services.yaml",
  "bookmarks.yaml",
  "widgets.yaml",
  "custom.css",
  "custom.js",
];

function hash(buffer) {
  const hashSum = createHash("sha256");
  hashSum.update(buffer);
  return hashSum.digest("hex");
}

export default async function handler(req, res) {
  const hashes = configs.map((config) => {
    checkAndCopyConfig(config);
    const configYaml = join(CONF_DIR, config);
    return hash(readFileSync(configYaml, "utf8"));
  });

  // set to date by docker entrypoint, will force revalidation between restarts/recreates
  const buildTime = process.env.HOMEPAGE_BUILDTIME?.length ? process.env.HOMEPAGE_BUILDTIME : "";

  const combinedHash = hash(hashes.join("") + buildTime);

  res.send({
    hash: combinedHash,
  });
}
