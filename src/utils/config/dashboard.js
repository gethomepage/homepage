import cache from "memory-cache";
import { serverSideTranslations } from "next-i18next/pages/serverSideTranslations";

import { bookmarksResponse, servicesResponse, widgetsResponse } from "utils/config/api-response";
import { getSettings } from "utils/config/config";
import createLogger from "utils/logger";

const cacheKey = "homepageDashboardData";

export function invalidateDashboardData() {
  cache.del(cacheKey);
}

async function loadDashboardData() {
  const { providers, ...settings } = getSettings();
  const language = settings.language?.toLowerCase() === "zh-cn" ? "zh-Hans" : settings.language || "en";
  const [services, bookmarks, widgets, translations] = await Promise.all([
    servicesResponse(),
    bookmarksResponse(),
    widgetsResponse(),
    serverSideTranslations(language),
  ]);
  return {
    initialSettings: settings,
    fallback: {
      "/api/services": services,
      "/api/bookmarks": bookmarks,
      "/api/widgets": widgets,
      "/api/hash": false,
    },
    ...translations,
  };
}

export async function getDashboardData() {
  let pending = cache.get(cacheKey);
  if (!pending) {
    pending = loadDashboardData().catch((error) => {
      if (cache.get(cacheKey) === pending) invalidateDashboardData();
      throw error;
    });
    cache.put(cacheKey, pending);
  }
  try {
    return await pending;
  } catch (error) {
    createLogger("index").error(error);
    return {
      initialSettings: {},
      fallback: { "/api/services": [], "/api/bookmarks": [], "/api/widgets": [], "/api/hash": false },
      ...(await serverSideTranslations("en")),
    };
  }
}
