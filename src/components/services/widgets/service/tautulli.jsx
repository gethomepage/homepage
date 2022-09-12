/* eslint-disable camelcase */
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { BsFillPlayFill, BsPauseFill } from "react-icons/bs";

import Widget from "../widget";

import { formatApiUrl } from "utils/api-helpers";

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

function SingleSessionEntry({ session }) {
  const { full_title, duration, view_offset, progress_percent, state, year, grandparent_year } = session;

  return (
    <>
      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div className="text-xs z-10 self-center ml-2">
          <span>{full_title}</span>
        </div>
        <div className="grow" />
        <div className="self-center text-xs flex justify-end mr-2">{year || grandparent_year}</div>
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
            <BsFillPlayFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
          )}
          {state !== "paused" && (
            <BsPauseFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
          )}
        </div>
        <div className="grow " />
        <div className="self-center text-xs flex justify-end mr-2">
          {millisecondsToString(view_offset)} / {millisecondsToString(duration)}
        </div>
      </div>
    </>
  );
}

function SessionEntry({ session }) {
  const { full_title, view_offset, progress_percent, state } = session;

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
          <BsFillPlayFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
        )}
        {state !== "paused" && (
          <BsPauseFill className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80" />
        )}
        <span>{full_title}</span>
      </div>
      <div className="grow " />
      <div className="self-center text-xs flex justify-end mr-2">{millisecondsToString(view_offset)}</div>
    </div>
  );
}

export default function Tautulli({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: activityData, error: activityError } = useSWR(formatApiUrl(config, "get_activity"), {
    refreshInterval: 5000,
  });

  if (activityError) {
    return <Widget error={t("widget.api_error")} />;
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

  if (playing.length === 1) {
    const session = playing[0];
    return (
      <div className="flex flex-col pb-1 mx-1">
        <SingleSessionEntry session={session} />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      {playing.map((session) => (
        <SessionEntry key={session.Id} session={session} />
      ))}
    </div>
  );
}
