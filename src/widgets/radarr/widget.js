import { asJson, jsonArrayFilter } from "utils/proxy/api-helpers";
import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/v3/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    movie: {
      endpoint: "movie",
      map: (data) => ({
        wanted: jsonArrayFilter(data, (item) => item.monitored && !item.hasFile && item.isAvailable).length,
        have: jsonArrayFilter(data, (item) => item.hasFile).length,
        missing: jsonArrayFilter(data, (item) => item.monitored && !item.hasFile).length,
        all: asJson(data).map((entry) => ({
          title: entry.title,
          id: entry.id,
        })),
      }),
    },
    "queue/status": {
      endpoint: "queue/status",
      validate: ["totalCount"],
    },
    "queue/details": {
      endpoint: "queue/details",
      map: (data) =>
        asJson(data)
          .map((entry) => ({
            trackedDownloadState: entry.trackedDownloadState,
            trackedDownloadStatus: entry.trackedDownloadStatus,
            timeLeft: entry.timeleft,
            size: entry.size,
            sizeLeft: entry.sizeleft,
            movieId: entry.movieId ?? entry.id,
            status: entry.status,
          }))
          .sort((a, b) => {
            const downloadingA = (a.status ?? a.trackedDownloadState) === "downloading";
            const downloadingB = (b.status ?? b.trackedDownloadState) === "downloading";
            if (downloadingA && !downloadingB) {
              return -1;
            }
            if (downloadingB && !downloadingA) {
              return 1;
            }

            const percentA = a.size > 0 ? a.sizeLeft / a.size : 1;
            const percentB = b.size > 0 ? b.sizeLeft / b.size : 1;
            if (percentA < percentB) {
              return -1;
            }
            if (percentA > percentB) {
              return 1;
            }
            return 0;
          }),
    },
    calendar: {
      endpoint: "calendar",
      params: ["start", "end", "unmonitored"],
    },
  },
};

export default widget;
