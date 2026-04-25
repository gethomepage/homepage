import { asJson } from "utils/proxy/api-helpers";
import archisteamfarmProxyHandler from "./proxy";

const widget = {
  api: "{url}/Api/{endpoint}",
  proxyHandler: archisteamfarmProxyHandler,

  mappings: {
    bots: {
      endpoint: "Bot/ASF",
      validate: ["Result"],
      map: (data) => ({
        count: Object.keys(asJson(data).Result ?? {}).length,
      }),
    },
    stats: {
      endpoint: "ASF",
      validate: ["Result"],
      map: (data) => {
        const result = asJson(data).Result ?? {};

        return {
          version: result.Version,
          memoryKiB: Number.isFinite(result.MemoryUsage) ? result.MemoryUsage : Number(result.MemoryUsage ?? NaN),
          processStartTime: result.ProcessStartTime,
        };
      },
    },
  },
};

export default widget;
