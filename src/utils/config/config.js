/* eslint-disable no-console */
import { join } from "path";
import { existsSync, readFileSync, copyFileSync } from "fs";

import cache from "memory-cache";
import yaml from "js-yaml";

const cacheKey = "homepageEnvironmentVariables";
const homepageVarPrefix = "HOMEPAGE_VAR_";
const homepageFilePrefix = "HOMEPAGE_FILE_";

export default function checkAndCopyConfig(config) {
  const configYaml = join(process.cwd(), "config", config);
  if (!existsSync(configYaml)) {
    const configSkeleton = join(process.cwd(), "src", "skeleton", config);
    try {
      copyFileSync(configSkeleton, configYaml)
      console.info("%s was copied to the config folder", config);
    } catch (err) {
        console.error("error copying config", err);
        throw err;
    }

    return true;
  }

  try {
    yaml.load(readFileSync(configYaml, "utf8"));
    return true;
  } catch (e) {
    return { ...e, config };
  }
}

function getCachedEnvironmentVars() {
  let cachedVars = cache.get(cacheKey);
  if (!cachedVars) {
    // initialize cache
    cachedVars = Object.entries(process.env).filter(([key, ]) => key.includes(homepageVarPrefix) || key.includes(homepageFilePrefix));
    cache.put(cacheKey, cachedVars);
  }
  return cachedVars;
}

export function substituteEnvironmentVars(str) {
  let result = str;
  if (result.includes('{{')) { // crude check if we have vars to replace
    const cachedVars = getCachedEnvironmentVars();
    cachedVars.forEach(([key, value]) => {
      if (key.startsWith(homepageVarPrefix)) {
        result = result.replaceAll(`{{${key}}}`, value);
      } else if (key.startsWith(homepageFilePrefix)) {
        const filename = value;
        const fileContents = readFileSync(filename, "utf8");
        result = result.replaceAll(`{{${key}}}`, fileContents);
      }
    });
  }
  return result;
}

export function getSettings() {
  checkAndCopyConfig("settings.yaml");

  const settingsYaml = join(process.cwd(), "config", "settings.yaml");
  const rawFileContents = readFileSync(settingsYaml, "utf8");
  const fileContents = substituteEnvironmentVars(rawFileContents);
  const initialSettings = yaml.load(fileContents) ?? {};

  if (initialSettings.layout) {
    // support yaml list but old spec was object so convert to that
    // see https://github.com/benphelps/homepage/issues/1546
    if (Array.isArray(initialSettings.layout)) {
      const layoutItems = initialSettings.layout
      initialSettings.layout = {}
      layoutItems.forEach(i => {
        const name = Object.keys(i)[0]
        initialSettings.layout[name] = i[name]
      })
    }
  }

  return initialSettings
}
