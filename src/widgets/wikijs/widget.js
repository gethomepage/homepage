import { parseWikiJsMetrics } from "./metrics";

import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    metrics: {
      endpoint: "metrics",
      rawText: true,
      map: parseWikiJsMetrics,
    },
  },
};

export default widget;