/* eslint-disable camelcase */
import { useTranslation } from "next-i18next";
import { BsFillPlayFill, BsPauseFill, BsCpu, BsFillCpuFill } from "react-icons/bs";
import { MdOutlineSmartDisplay, MdSmartDisplay } from "react-icons/md";

import Container from "components/services/widget/container";
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

function SingleSessionEntry({ session, enableUser }) {
  const { full_title, duration, view_offset, progress_percent, state, video_decision, audio_decision, username } =
    session;

  return (
    <>
      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div className="text-xs z-10 self-center ml-2 relative w-full h-4 grow mr-2">
          <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden">
            {full_title}
            {enableUser && ` (${username})`}
          </div>
        </div>
        <div className="self-center text-xs flex justify-end mr-1.5 pl-1">
          {video_decision === "direct play" && audio_decision === "direct play" && (
            <MdSmartDisplay className="opacity-50" />
          )}
          {video_decision === "copy" && audio_decision === "copy" && <MdOutlineSmartDisplay className="opacity-50" />}
          {video_decision !== "copy" &&
            video_decision !== "direct play" &&
            (audio_decision !== "copy" || audio_decision !== "direct play") && <BsFillCpuFill className="opacity-50" />}
          {(video_decision === "copy" || video_decision === "direct play") &&
            audio_decision !== "copy" &&
            audio_decision !== "direct play" && <BsCpu className="opacity-50" />}
        </div>
      </div>

      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div
          className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
          style={{
            width: `${progress_percent}%`,
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
          {millisecondsToString(view_offset)}
          <span className="mx-0.5 text-[8px]">/</span>
          {millisecondsToString(duration)}
        </div>
      </div>
    </>
  );
}

function SessionEntry({ session, enableUser }) {
  const { full_title, view_offset, progress_percent, state, video_decision, audio_decision, username } = session;

  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${progress_percent}%`,
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
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden">
          {full_title}
          {enableUser && ` (${username})`}
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10">
        {video_decision === "direct play" && audio_decision === "direct play" && (
          <MdSmartDisplay className="opacity-50" />
        )}
        {video_decision === "copy" && audio_decision === "copy" && <MdOutlineSmartDisplay className="opacity-50" />}
        {video_decision !== "copy" &&
          video_decision !== "direct play" &&
          (audio_decision !== "copy" || audio_decision !== "direct play") && <BsFillCpuFill className="opacity-50" />}
        {(video_decision === "copy" || video_decision === "direct play") &&
          audio_decision !== "copy" &&
          audio_decision !== "direct play" && <BsCpu className="opacity-50" />}
      </div>
      <div className="self-center text-xs flex justify-end mr-2 z-10">{millisecondsToString(view_offset)}</div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: activityData, error: activityError } = useWidgetAPI(widget, "get_activity", {
    refreshInterval: 5000,
  });

  if (activityError || (activityData && Object.keys(activityData.response.data).length === 0)) {
    return <Container service={service} error={activityError ?? { message: t("tautulli.plex_connection_error") }} />;
  }

  if (!activityData) {
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
      </div>
    );
  }

  const playing = activityData.response.data.sessions.sort((a, b) => {
    if (a.view_offset > b.view_offset) {
      return 1;
    }
    if (a.view_offset < b.view_offset) {
      return -1;
    }
    return 0;
  });

  if (playing.length === 0) {
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("tautulli.no_active")}</span>
        </div>
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
      </div>
    );
  }

  const enableUser = !!service.widget?.enableUser;

  if (playing.length === 1) {
    const session = playing[0];
    return (
      <div className="flex flex-col pb-1 mx-1">
        <SingleSessionEntry session={session} enableUser={enableUser} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      {playing.map((session) => (
        <SessionEntry key={session.Id} session={session} enableUser={enableUser} />
      ))}
    </div>
  );
}
