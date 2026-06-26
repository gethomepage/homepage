import { copyFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";

import yaml from "js-yaml";
import cache from "memory-cache";

const cacheKey = "homepageEnvironmentVariables";
const homepageVarPrefix = "HOMEPAGE_VAR_";
const homepageFilePrefix = "HOMEPAGE_FILE_";

export const CONF_DIR = process.env.HOMEPAGE_CONFIG_DIR
  ? process.env.HOMEPAGE_CONFIG_DIR
  : join(process.cwd(), "config");

export const SKELETON_DIR = join(process.cwd(), "src", "skeleton");

// Resolve the path a config file should be read from. The user's config
// directory is preferred, falling back to the bundled skeleton when the file
// is not present there. This keeps Homepage working when the config directory
// is read-only and only some files are provided — e.g. individual files
// mounted via subPath from a Kubernetes ConfigMap. See #2040 and #2172.
export function getConfigPath(config) {
  const configYaml = join(CONF_DIR, config);
  if (existsSync(configYaml)) {
    return configYaml;
  }
  return join(SKELETON_DIR, config);
}

export default function checkAndCopyConfig(config) {
  // Ensure config directory exists
  if (!existsSync(CONF_DIR)) {
    try {
      mkdirSync(CONF_DIR, { recursive: true });
    } catch (e) {
      console.warn(`Could not create config directory ${CONF_DIR}: ${e.message}`);
      return false;
    }
  }

  const configYaml = join(CONF_DIR, config);

  // If the config file doesn't exist, try to copy the skeleton
  if (!existsSync(configYaml)) {
    const configSkeleton = join(SKELETON_DIR, config);
    try {
      copyFileSync(configSkeleton, configYaml);
      console.info("%s was copied to the config folder", config);
    } catch (err) {
      // The config directory may be read-only — for example when individual
      // files are mounted via subPath from a Kubernetes ConfigMap. In that
      // case we cannot seed the default file, but we can still run using the
      // bundled skeleton (see getConfigPath), so warn and continue instead of
      // crashing the whole app. See #2040 and #2172.
      console.warn(
        "Could not copy default %s into %s (%s); falling back to the bundled skeleton.",
        config,
        CONF_DIR,
        err.code || err.message,
      );
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
    cachedVars = Object.entries(process.env).filter(
      ([key]) => key.includes(homepageVarPrefix) || key.includes(homepageFilePrefix),
    );
    cache.put(cacheKey, cachedVars);
  }
  return cachedVars;
}

export function substituteEnvironmentVars(str) {
  let result = str;
  if (result.includes("{{")) {
    // crude check if we have vars to replace
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

  const settingsYaml = getConfigPath("settings.yaml");
  const rawFileContents = readFileSync(settingsYaml, "utf8");
  const fileContents = substituteEnvironmentVars(rawFileContents);
  const initialSettings = yaml.load(fileContents) ?? {};

  if (initialSettings.layout) {
    // support yaml list but old spec was object so convert to that
    // see https://github.com/gethomepage/homepage/issues/1546
    if (Array.isArray(initialSettings.layout)) {
      const layoutItems = initialSettings.layout;
      initialSettings.layout = {};
      layoutItems.forEach((i) => {
        const name = Object.keys(i)[0];
        initialSettings.layout[name] = i[name];
      });
    }
  }
  return initialSettings;
}
