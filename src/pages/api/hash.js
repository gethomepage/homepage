import { join } from "path";
import { createHash } from "crypto";
import { readFileSync } from "fs";

import checkAndCopyConfig from "utils/config/config";

const configs = ["docker.yaml", "settings.yaml", "services.yaml", "bookmarks.yaml", "widgets.yaml"];

function hash(buffer) {
  const hashSum = createHash("sha256");
  hashSum.update(buffer);
  return hashSum.digest("hex");
}

export default async function handler(req, res) {
  const hashes = configs.map((config) => {
    checkAndCopyConfig(config);
    const configYaml = join(process.cwd(), "config", config);
    return hash(readFileSync(configYaml, "utf8"));
  });

  // set to date by docker entrypoint, will force revalidation between restarts/recreates
  const buildTime = process.env.HOMEPAGE_BUILDTIME?.length ? process.env.HOMEPAGE_BUILDTIME : '';

  const combinedHash = hash(hashes.join("") + buildTime);

  res.send({
    hash: combinedHash,
  });
}
