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

  const combinedHash = hash(hashes.join(""));

  res.send({
    hash: combinedHash,
  });
}
