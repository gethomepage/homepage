import { join, path } from "path";
import { existsSync, copyFile, promises as fs } from "fs";
import yaml from "js-yaml";

export default function checkAndCopyConfig(config) {
  const configYaml = join(process.cwd(), "config", config);
  if (!existsSync(configYaml)) {
    const configSkeleton = join(process.cwd(), "src", "skeleton", config);
    copyFile(configSkeleton, configYaml, (err) => {
      if (err) {
        console.log("error copying config", err);
        throw err;
      }
      console.info("%s was copied to the config folder", config);
    });
  }
}

export async function getSettings() {
  checkAndCopyConfig("settings.yaml");

  const settingsYaml = path.join(process.cwd(), "config", "settings.yaml");
  const fileContents = await fs.readFile(settingsYaml, "utf8");
  return yaml.load(fileContents);
}
