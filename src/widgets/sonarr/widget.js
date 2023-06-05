import genericProxyHandler from "utils/proxy/handlers/generic";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v3/{endpoint}?apikey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    series: {
      endpoint: "series",
      map: (data) => asJson(data).map((entry) => ({
        title: entry.title,
        id: entry.id
      }))
    },
    queue: {
      endpoint: "queue",
      validate: [
        "totalRecords"
      ]
    },
    "wanted/missing": {
      endpoint: "wanted/missing",
      validate: [
        "totalRecords"
      ]
    },
    "queue/details": {
      endpoint: "queue/details",
      map: (data) => asJson(data).map((entry) => ({
        trackedDownloadState: entry.trackedDownloadState,
        trackedDownloadStatus: entry.trackedDownloadStatus,
        timeLeft: entry.timeleft,
        size: entry.size,
        sizeLeft: entry.sizeleft,
        seriesId: entry.seriesId,
        episodeTitle: entry.episode?.title,
        episodeId: entry.episodeId,
        status: entry.status
      })).sort((a, b) => {
        const downloadingA = a.trackedDownloadState === "downloading"
        const downloadingB = b.trackedDownloadState === "downloading"
        if (downloadingA && !downloadingB) {
          return -1;
        }
        if (downloadingB && !downloadingA) {
          return 1;
        }

        const percentA = a.sizeLeft / a.size;
        const percentB = b.sizeLeft / b.size;
        if (percentA < percentB) {
          return -1;
        }
        if (percentA > percentB) {
          return 1;
        }
        return 0;
      })
    }
  },
};

export default widget;
