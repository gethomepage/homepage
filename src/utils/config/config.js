/* eslint-disable no-console */
import { join } from "path";
import { existsSync, copyFile, readFileSync, statSync } from "fs";

import yaml from "js-yaml";

export default function checkAndCopyConfig(config) {
  const configYaml = join(process.cwd(), "config", config);
  if (!existsSync(configYaml)) {
    const configSkeleton = join(process.cwd(), "src", "skeleton", config);
    copyFile(configSkeleton, configYaml, (err) => {
      if (err) {
        console.error("error copying config", err);
        throw err;
      }
      console.info("%s was copied to the config folder", config);
    });

    return true;
  }

  try {
    yaml.load(readFileSync(configYaml, "utf8"));
    return true;
  } catch (e) {
    return { ...e, config };
  }
}

export function getSettings() {
  checkAndCopyConfig("settings.yaml");

  const settingsYaml = join(process.cwd(), "config", "settings.yaml");
  const fileContents = readFileSync(settingsYaml, "utf8");

  let stats;
  try {
    stats = statSync(settingsYaml);
  } catch (e) {
    stats = {};
  }

  const yamlLoaded = yaml.load(fileContents) ?? {};

  return { 
    ...yamlLoaded,
    isValid: fileContents !== "-\n" && stats.size !== 2 // see https://github.com/benphelps/homepage/pull/609
  };
}