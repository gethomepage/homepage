import { useTranslation } from "next-i18next";
import { useCallback } from 'react';

import QueueEntry from "../../components/widgets/queue/queueEntry";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import BlockList from "components/services/widget/block-list";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: moviesData, error: moviesError } = useWidgetAPI(widget, "movie");
  const { data: queuedData, error: queuedError } = useWidgetAPI(widget, "queue/status");
  const { data: queueDetailsData, error: queueDetailsError } = useWidgetAPI(widget, "queue/details");

  // information taken from the Radarr docs: https://radarr.video/docs/api/
  const formatDownloadState = useCallback((downloadState) => {
    switch (downloadState) {
      case "importPending":
        return "import pending";
      case "failedPending":
        return "failed pending";
      default:
        return downloadState;
    }
  }, []);

  if (moviesError || queuedError || queueDetailsError) {
    const finalError = moviesError ?? queuedError ?? queueDetailsError;
    return <Container service={service} error={finalError} />;
  }

  const enableQueue = widget?.enableQueue;

  if (!moviesData || !queuedData || !queueDetailsData) {
    return (
      <>
        <Container service={service}>
          <Block label="radarr.wanted" />
          <Block label="radarr.missing" />
          <Block label="radarr.queued" />
          <Block label="radarr.movies" />
        </Container>
        { enableQueue &&
          <Container service={service}>
            <BlockList label="radarr.queued" />
          </Container>
        }
      </>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="radarr.wanted" value={t("common.number", { value: moviesData.wanted })} />
        <Block label="radarr.missing" value={t("common.number", { value: moviesData.missing })} />
        <Block label="radarr.queued" value={t("common.number", { value: queuedData.totalCount })} />
        <Block label="radarr.movies" value={t("common.number", { value: moviesData.have })} />
      </Container>
      { enableQueue &&
        <Container service={service}>
          <BlockList label="radarr.queue" childHeight={24}>
            {Array.isArray(queueDetailsData) ? queueDetailsData.map((queueEntry) => (
              <QueueEntry
                progress={(1 - queueEntry.sizeLeft / queueEntry.size) * 100}
                status={queueEntry.status}
                timeLeft={queueEntry.timeLeft}
                title={moviesData.all.find((entry) => entry.id === queueEntry.movieId)?.title}
                activity={formatDownloadState(queueEntry.trackedDownloadState)}
                key={queueEntry.movieId}
              />
            )) : undefined}
          </BlockList>
        </Container>
      }
    </>
  );
}
