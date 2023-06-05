import { useTranslation } from "next-i18next";
import { useCallback } from 'react';

import QueueEntry from "../../components/widgets/queue/queueEntry";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import BlockList from 'components/services/widget/block-list';

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted/missing");
  const { data: queuedData, error: queuedError } = useWidgetAPI(widget, "queue");
  const { data: seriesData, error: seriesError } = useWidgetAPI(widget, "series");
  const { data: queueDetailsData, error: queueDetailsError } = useWidgetAPI(widget, "queue/details");

  // information taken from the Sonarr docs: https://sonarr.tv/docs/api/
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

  if (wantedError || queuedError || seriesError || queueDetailsError) {
    const finalError = wantedError ?? queuedError ?? seriesError ?? queueDetailsError;
    return <Container service={service} error={finalError} />;
  }

  const enableQueue = widget?.enableQueue;

  if (!wantedData || !queuedData || !seriesData || !queueDetailsData) {
    return (
      <>
        <Container service={service}>
          <Block label="sonarr.wanted" />
          <Block label="sonarr.queued" />
          <Block label="sonarr.series" />
        </Container>
        { enableQueue &&
          <Container service={service}>
            <BlockList label="sonarr.queued" />
          </Container>
        }
      </>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="sonarr.wanted" value={t("common.number", { value: wantedData.totalRecords })} />
        <Block label="sonarr.queued" value={t("common.number", { value: queuedData.totalRecords })} />
        <Block label="sonarr.series" value={t("common.number", { value: seriesData.length })} />
      </Container>
      { enableQueue &&
        <Container service={service}>
          <BlockList label="sonarr.queue" childHeight={24}>
            {Array.isArray(queueDetailsData) ? queueDetailsData.map((queueEntry) => (
              <QueueEntry
                progress={(1 - queueEntry.sizeLeft / queueEntry.size) * 100}
                status={queueEntry.status}
                timeLeft={queueEntry.timeLeft}
                title={`${seriesData.find((entry) => entry.id === queueEntry.seriesId)?.title  } • ${  queueEntry.episodeTitle}`}
                activity={formatDownloadState(queueEntry.trackedDownloadState)}
                key={queueEntry.episodeId}
              />
            )) : undefined}
          </BlockList>
        </Container>
      }
    </>
  );
}
