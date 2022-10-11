/* eslint-disable no-console */
import { join } from "path";
import { existsSync, copyFile, readFileSync } from "fs";

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
  return yaml.load(fileContents);
}

export function sanitizePrivateOptions(options, privateOnly = false) {
  const privateOptions = ["url", "username", "password", "key"];
  const sanitizedOptions = {};
  Object.keys(options).forEach((key) => { 
    if (!privateOnly && !privateOptions.includes(key)) {
      sanitizedOptions[key] = options[key];
    } else if (privateOnly && privateOptions.includes(key)) {
      sanitizedOptions[key] = options[key];
    }
  });
  return sanitizedOptions;
}