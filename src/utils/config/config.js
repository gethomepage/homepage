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

export function substituteEnvironmentVars(str) {
  const homepageVarPrefix = "HOMEPAGE_VAR_";
  const homepageFilePrefix = "HOMEPAGE_FILE_";

  let result = str;
  Object.keys(process.env).forEach(key => {
    if (key.startsWith(homepageVarPrefix)) {
      result = result.replaceAll(`{{${key}}}`, process.env[key]);
    } else if (key.startsWith(homepageFilePrefix)) {
      const filename = process.env[key];
      const fileContents = readFileSync(filename, "utf8");
      result = result.replaceAll(`{{${key}}}`, fileContents);
    }
  });
  return result;
}

export function getSettings() {
  checkAndCopyConfig("settings.yaml");

  const settingsYaml = join(process.cwd(), "config", "settings.yaml");
  const rawFileContents = readFileSync(settingsYaml, "utf8");
  const fileContents = substituteEnvironmentVars(rawFileContents);
  return yaml.load(fileContents) ?? {};
}
