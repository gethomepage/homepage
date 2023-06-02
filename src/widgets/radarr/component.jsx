import { useTranslation } from "next-i18next";
import { useCallback } from 'react';
import classNames from 'classnames';

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

  if (!moviesData || !queuedData || !queueDetailsData) {
    return (
      <>
        <Container service={service}>
          <Block label="radarr.wanted" />
          <Block label="radarr.missing" />
          <Block label="radarr.queued" />
          <Block label="radarr.movies" />
        </Container>
        <Container service={service}>
          <BlockList label="radarr.queued" />
        </Container>
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
      <Container service={service}>
        <BlockList label="radarr.queued" childHeight={52}>
          {Array.isArray(queueDetailsData) ? queueDetailsData.map((queueEntry) => (
            <div className="my-0.5 w-full flex flex-col justify-between items-center" key={queueEntry.movieId}>
              <div className="h-6 w-full flex flex-row justify-between items-center">
                <div className="w-full mr-5 overflow-hidden">
                  <div className="whitespace-nowrap w-0 text-left">{moviesData.all.find((entry) => entry.id === queueEntry.movieId)?.title}</div>
                </div>
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
