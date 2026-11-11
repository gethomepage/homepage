import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import QueueEntry from "../../components/widgets/queue/queueEntry";

import useWidgetAPI from "utils/proxy/use-widget-api";

function getProgress(sizeLeft, size) {
  if (!Number.isFinite(size) || size <= 0) return 0;
  return Math.min(100, Math.max(0, (1 - sizeLeft / size) * 100));
}

function formatDownloadState(downloadState) {
  switch (downloadState) {
    case "importBlocked":
      return "import blocked";
    case "importPending":
      return "import pending";
    case "failedPending":
      return "failed pending";
    default:
      return downloadState;
  }
}

function getActivity(status, trackedDownloadState) {
  const completedStates = ["importBlocked", "importPending", "importing", "failedPending"];
  const downloadState =
    status === "completed" && completedStates.includes(trackedDownloadState)
      ? trackedDownloadState
      : (status ?? trackedDownloadState);

  return formatDownloadState(downloadState);
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: moviesData, error: moviesError } = useWidgetAPI(widget, "movie");
  const { data: queuedData, error: queuedError } = useWidgetAPI(widget, "queue/status");
  const { data: queueDetailsData, error: queueDetailsError } = useWidgetAPI(widget, "queue/details");

  if (moviesError || queuedError || queueDetailsError) {
    const finalError = moviesError ?? queuedError ?? queueDetailsError;
    return <Container service={service} error={finalError} />;
  }

  if (!moviesData || !queuedData || !queueDetailsData) {
    return (
      <Container service={service}>
        <Block label="radarr.wanted" />
        <Block label="radarr.missing" />
        <Block label="radarr.queued" />
        <Block label="radarr.movies" />
      </Container>
    );
  }

  const enableQueue = widget?.enableQueue && Array.isArray(queueDetailsData) && queueDetailsData.length > 0;

  return (
    <>
      <Container service={service}>
        <Block label="radarr.wanted" value={t("common.number", { value: moviesData.wanted })} />
        <Block label="radarr.missing" value={t("common.number", { value: moviesData.missing })} />
        <Block label="radarr.queued" value={t("common.number", { value: queuedData.totalCount })} />
        <Block label="radarr.movies" value={t("common.number", { value: moviesData.have })} />
      </Container>
      {enableQueue &&
        queueDetailsData.map((queueEntry) => (
          <QueueEntry
            progress={getProgress(queueEntry.sizeLeft, queueEntry.size)}
            timeLeft={queueEntry.timeLeft}
            title={moviesData.all.find((entry) => entry.id === queueEntry.movieId)?.title ?? t("radarr.unknown")}
            activity={getActivity(queueEntry.status, queueEntry.trackedDownloadState)}
            key={`${queueEntry.movieId}-${queueEntry.sizeLeft}`}
          />
        ))}
    </>
  );
}
