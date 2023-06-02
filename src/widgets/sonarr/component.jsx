import { useTranslation } from "next-i18next";
import classNames from 'classnames';
import { useCallback } from 'react';

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

  if (!wantedData || !queuedData || !seriesData || !queueDetailsData) {
    return (
      <>
        <Container service={service}>
          <Block label="sonarr.wanted" />
          <Block label="sonarr.queued" />
          <Block label="sonarr.series" />
        </Container>
        <Container service={service}>
          <BlockList label="sonarr.queued" />
        </Container>
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
      <Container service={service}>
        <BlockList label="sonarr.queued" childHeight={52}>
          {Array.isArray(queueDetailsData) ? queueDetailsData.map((queueEntry) => (
            <div className="my-0.5 w-full flex flex-col justify-between items-center" key={queueEntry.episodeId}>
              <div className="h-6 w-full flex flex-row justify-between items-center">
                <div className="overflow-ellipsis whitespace-nowrap overflow-hidden w-3/4 text-left">{seriesData.find((entry) => entry.id === queueEntry.seriesId).title} • {queueEntry.episodeTitle}</div>
                <div>{formatDownloadState(queueEntry.trackedDownloadState)}</div>
              </div>
              <div className="h-6 w-full flex flex-row justify-between items-center">
                <div className="mr-5 w-full bg-theme-800/30 rounded-full h-full dark:bg-theme-200/20">
                  <div
                    className={classNames(
                      "h-full rounded-full transition-all duration-1000",
                      queueEntry.trackedDownloadStatus === "ok" ? "bg-blue-500/80" : "bg-orange-500/80"
                    )}
                    style={{
                      width: `${(1 - queueEntry.sizeLeft / queueEntry.size) * 100}%`,
                    }}
                  />
                </div>
                <div className="w-24 text-right">{queueEntry.timeLeft}</div>
              </div>
            </div>
          )) : undefined}
        </BlockList>
      </Container>
    </>
  );
}
