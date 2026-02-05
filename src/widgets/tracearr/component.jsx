import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import { BsCpu, BsFillCpuFill, BsFillPlayFill, BsPauseFill } from "react-icons/bs";
import { MdOutlineSmartDisplay, MdSmartDisplay } from "react-icons/md";

import useWidgetAPI from "utils/proxy/use-widget-api";

function millisecondsToTime(milliseconds) {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function millisecondsToString(milliseconds) {
  const { hours, minutes, seconds } = millisecondsToTime(milliseconds);
  const parts = [];
  if (hours > 0) {
    parts.push(hours);
  }
  parts.push(minutes);
  parts.push(seconds);

  return parts.map((part) => part.toString().padStart(2, "0")).join(":");
}

function generateStreamTitle(stream, enableUser, showEpisodeNumber) {
  let streamTitle = "";
  const { mediaType, mediaTitle, showTitle, seasonNumber, episodeNumber, username } = stream;

  if (mediaType === "episode" && showEpisodeNumber) {
    const seasonStr = `S${seasonNumber.toString().padStart(2, "0")}`;
    const episodeStr = `E${episodeNumber.toString().padStart(2, "0")}`;
    streamTitle = `${showTitle}: ${seasonStr} · ${episodeStr} - ${mediaTitle}`;
  } else if (mediaType === "episode") {
    streamTitle = `${showTitle} - ${mediaTitle}`;
  } else {
    streamTitle = mediaTitle;
  }

  return enableUser ? `${streamTitle} (${username})` : streamTitle;
}

function SingleStreamEntry({ stream, enableUser, showEpisodeNumber }) {
  const { durationMs, progressMs, state, videoDecision, audioDecision } = stream;
  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const streamTitle = generateStreamTitle(stream, enableUser, showEpisodeNumber);

  return (
    <>
      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
          <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden" title={streamTitle}>
            {streamTitle}
          </div>
        </div>
        <div className="self-center text-xs flex justify-end mr-1.5 pl-1">
          {videoDecision === "directplay" && audioDecision === "directplay" && (
            <MdSmartDisplay className="opacity-50" />
          )}
          {videoDecision === "copy" && audioDecision === "copy" && <MdOutlineSmartDisplay className="opacity-50" />}
          {videoDecision !== "copy" &&
            videoDecision !== "directplay" &&
            (audioDecision !== "copy" || audioDecision !== "directplay") && <BsFillCpuFill className="opacity-50" />}
          {(videoDecision === "copy" || videoDecision === "directplay") &&
            audioDecision !== "copy" &&
            audioDecision !== "directplay" && <BsCpu className="opacity-50" />}
        </div>
      </div>

      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div
          className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
          style={{
            width: `${progressPercent}%`,
          }}
        />
        <div className="text-xs z-10 self-center ml-1">
          {state === "paused" && (
            <BsPauseFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
          )}
          {state !== "paused" && (
            <BsFillPlayFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
          )}
        </div>
        <div className="grow " />
        <div className="self-center text-xs flex justify-end mr-2 z-10">
          {millisecondsToString(progressMs)}
          <span className="mx-0.5 text-[8px]">/</span>
          {millisecondsToString(durationMs)}
        </div>
      </div>
    </>
  );
}

function StreamEntry({ stream, enableUser, showEpisodeNumber }) {
  const { durationMs, progressMs, state, videoDecision, audioDecision } = stream;
  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const streamTitle = generateStreamTitle(stream, enableUser, showEpisodeNumber);

  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${progressPercent}%`,
        }}
      />
      <div className="text-xs z-10 self-center ml-1">
        {state === "paused" && (
          <BsPauseFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
        )}
        {state !== "paused" && (
          <BsFillPlayFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
        )}
      </div>
      <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden" title={streamTitle}>
          {streamTitle}
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10">
        {videoDecision === "directplay" && audioDecision === "directplay" && <MdSmartDisplay className="opacity-50" />}
        {videoDecision === "copy" && audioDecision === "copy" && <MdOutlineSmartDisplay className="opacity-50" />}
        {videoDecision !== "copy" &&
          videoDecision !== "directplay" &&
          (audioDecision !== "copy" || audioDecision !== "directplay") && <BsFillCpuFill className="opacity-50" />}
        {(videoDecision === "copy" || videoDecision === "directplay") &&
          audioDecision !== "copy" &&
          audioDecision !== "directplay" && <BsCpu className="opacity-50" />}
      </div>
      <div className="self-center text-xs flex justify-end mr-2 z-10">{millisecondsToString(progressMs)}</div>
    </div>
  );
}

function SummaryView({ summary, t }) {
  return (
    <Container>
      <Block label="tracearr.streams" value={t("common.number", { value: summary.total })} />
      <Block label="tracearr.transcodes" value={t("common.number", { value: summary.transcodes })} />
      <Block label="tracearr.directplay" value={t("common.number", { value: summary.directPlays })} />
      <Block label="tracearr.bitrate" value={summary.totalBitrate} />
    </Container>
  );
}

function DetailsView({ streams, enableUser, showEpisodeNumber, expandOneStreamToTwoRows, t }) {
  if (streams.length === 0) {
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("tracearr.no_active")}</span>
        </div>
        {expandOneStreamToTwoRows && (
          <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
            <span className="absolute left-2 text-xs mt-[2px]">-</span>
          </div>
        )}
      </div>
    );
  }

  if (expandOneStreamToTwoRows && streams.length === 1) {
    const stream = streams[0];
    return (
      <div className="flex flex-col pb-1 mx-1">
        <SingleStreamEntry stream={stream} enableUser={enableUser} showEpisodeNumber={showEpisodeNumber} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      {streams.map((stream) => (
        <StreamEntry key={stream.id} stream={stream} enableUser={enableUser} showEpisodeNumber={showEpisodeNumber} />
      ))}
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: streamsData, error: streamsError } = useWidgetAPI(widget, "streams", {
    refreshInterval: 5000,
  });

  const enableUser = !!service.widget?.enableUser;
  const expandOneStreamToTwoRows = service.widget?.expandOneStreamToTwoRows !== false;
  const showEpisodeNumber = !!service.widget?.showEpisodeNumber;
  const view = service.widget?.view ?? "details"; // "summary", "details", or "both"

  if (streamsError) {
    return <Container service={service} error={streamsError} />;
  }

  // Loading state
  if (!streamsData || !streamsData.data) {
    if (view === "summary") {
      return (
        <Container service={service}>
          <Block label="tracearr.streams" />
          <Block label="tracearr.transcodes" />
          <Block label="tracearr.directplay" />
          <Block label="tracearr.bitrate" />
        </Container>
      );
    }
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
        {expandOneStreamToTwoRows && (
          <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
            <span className="absolute left-2 text-xs mt-[2px]">-</span>
          </div>
        )}
      </div>
    );
  }

  const streams = streamsData.data.sort((a, b) => a.progressMs - b.progressMs);
  const { summary } = streamsData;

  if (view === "summary") {
    return (
      <Container service={service}>
        <Block label="tracearr.streams" value={t("common.number", { value: summary.total })} />
        <Block label="tracearr.transcodes" value={t("common.number", { value: summary.transcodes })} />
        <Block label="tracearr.directplay" value={t("common.number", { value: summary.directPlays })} />
        <Block label="tracearr.bitrate" value={summary.totalBitrate} />
      </Container>
    );
  }

  if (view === "both") {
    return (
      <>
        <Container service={service}>
          <Block label="tracearr.streams" value={t("common.number", { value: summary.total })} />
          <Block label="tracearr.transcodes" value={t("common.number", { value: summary.transcodes })} />
          <Block label="tracearr.directplay" value={t("common.number", { value: summary.directPlays })} />
          <Block label="tracearr.bitrate" value={summary.totalBitrate} />
        </Container>
        <DetailsView
          streams={streams}
          enableUser={enableUser}
          showEpisodeNumber={showEpisodeNumber}
          expandOneStreamToTwoRows={expandOneStreamToTwoRows}
          t={t}
        />
      </>
    );
  }

  // Default: details view
  return (
    <DetailsView
      streams={streams}
      enableUser={enableUser}
      showEpisodeNumber={showEpisodeNumber}
      expandOneStreamToTwoRows={expandOneStreamToTwoRows}
      t={t}
    />
  );
}
