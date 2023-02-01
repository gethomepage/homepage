import { useTranslation } from "next-i18next";
import { BsVolumeMuteFill, BsFillPlayFill, BsPauseFill, BsCpu, BsFillCpuFill } from "react-icons/bs";
import { MdOutlineSmartDisplay } from "react-icons/md";

import Container from "components/services/widget/container";
import { formatProxyUrlWithSegments } from "utils/proxy/api-helpers";
import useWidgetAPI from "utils/proxy/use-widget-api";

function ticksToTime(ticks) {
  const milliseconds = ticks / 10000;
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

function ticksToString(ticks) {
  const { hours, minutes, seconds } = ticksToTime(ticks);
  const parts = [];
  if (hours > 0) {
    parts.push(hours);
  }
  parts.push(minutes);
  parts.push(seconds);

  return parts.map((part) => part.toString().padStart(2, "0")).join(":");
}

function SingleSessionEntry({ playCommand, session }) {
  const {
    NowPlayingItem: { Name, SeriesName, RunTimeTicks },
    PlayState: { PositionTicks, IsPaused, IsMuted },
  } = session;

  const { IsVideoDirect, VideoDecoderIsHardware, VideoEncoderIsHardware } = session?.TranscodingInfo || {
    IsVideoDirect: true,
    VideoDecoderIsHardware: true,
    VideoEncoderIsHardware: true,
  };

  const percent = (PositionTicks / RunTimeTicks) * 100;

  return (
    <>
      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div className="grow text-xs z-10 self-center ml-2 relative w-full h-4 mr-2">
          <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden">
            {Name}
            {SeriesName && ` - ${SeriesName}`}
          </div>
        </div>
        <div className="self-center text-xs flex justify-end mr-1.5 pl-1">
          {IsVideoDirect && <MdOutlineSmartDisplay className="opacity-50" />}
          {!IsVideoDirect && (!VideoDecoderIsHardware || !VideoEncoderIsHardware) && <BsCpu className="opacity-50" />}
          {!IsVideoDirect && VideoDecoderIsHardware && VideoEncoderIsHardware && (
            <BsFillCpuFill className="opacity-50" />
          )}
        </div>
      </div>

      <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
        <div
          className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
          style={{
            width: `${percent}%`,
          }}
        />
        <div className="text-xs z-10 self-center ml-1">
          {IsPaused && (
            <BsFillPlayFill
              onClick={() => {
                playCommand(session, "Unpause");
              }}
              className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80"
            />
          )}
          {!IsPaused && (
            <BsPauseFill
              onClick={() => {
                playCommand(session, "Pause");
              }}
              className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80"
            />
          )}
        </div>
        <div className="grow " />
        <div className="self-center text-xs flex justify-end mr-1 z-10">{IsMuted && <BsVolumeMuteFill />}</div>
        <div className="self-center text-xs flex justify-end mr-2 z-10">
          {ticksToString(PositionTicks)}
          <span className="mx-0.5 text-[8px]">/</span>
          {ticksToString(RunTimeTicks)}
        </div>
      </div>
    </>
  );
}

function SessionEntry({ playCommand, session }) {
  const {
    NowPlayingItem: { Name, SeriesName, RunTimeTicks },
    PlayState: { PositionTicks, IsPaused, IsMuted },
  } = session;

  const { IsVideoDirect, VideoDecoderIsHardware, VideoEncoderIsHardware } = session?.TranscodingInfo || {};

  const percent = (PositionTicks / RunTimeTicks) * 100;

  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1 flex">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${percent}%`,
        }}
      />
      <div className="text-xs z-10 self-center ml-1">
        {IsPaused && (
          <BsFillPlayFill
            onClick={() => {
              playCommand(session, "Unpause");
            }}
            className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80"
          />
        )}
        {!IsPaused && (
          <BsPauseFill
            onClick={() => {
              playCommand(session, "Pause");
            }}
            className="inline-block w-4 h-4 cursor-pointer -mt-[1px] mr-1 opacity-80"
          />
        )}
      </div>
      <div className="grow text-xs z-10 self-center relative w-full h-4">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden">
          {Name}
          {SeriesName && ` - ${SeriesName}`}
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1 z-10">{IsMuted && <BsVolumeMuteFill />}</div>
      <div className="self-center text-xs flex justify-end mr-1 z-10">{ticksToString(PositionTicks)}</div>
      <div className="self-center items-center text-xs flex justify-end mr-1.5 pl-1 z-10">
        {IsVideoDirect && <MdOutlineSmartDisplay className="opacity-50" />}
        {!IsVideoDirect && (!VideoDecoderIsHardware || !VideoEncoderIsHardware) && <BsCpu className="opacity-50" />}
        {!IsVideoDirect && VideoDecoderIsHardware && VideoEncoderIsHardware && <BsFillCpuFill className="opacity-50" />}
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const {
    data: sessionsData,
    error: sessionsError,
    mutate: sessionMutate,
  } = useWidgetAPI(widget, "Sessions", {
    refreshInterval: 5000,
  });

  async function handlePlayCommand(session, command) {
    const url = formatProxyUrlWithSegments(widget, "PlayControl", {
      sessionId: session.Id,
      command,
    });
    await fetch(url).then(() => {
      sessionMutate();
    });
  }

  if (sessionsError) {
    return <Container error={sessionsError} />;
  }

  if (!sessionsData) {
    return (
      <div className="flex flex-col pb-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">-</span>
        </div>
      </div>
    );
  }

  const playing = sessionsData
    .filter((session) => session?.NowPlayingItem)
    .sort((a, b) => {
      if (a.PlayState.PositionTicks > b.PlayState.PositionTicks) {
        return 1;
      }
      if (a.PlayState.PositionTicks < b.PlayState.PositionTicks) {
        return -1;
      }
      return 0;
    });

  if (playing.length === 0) {
    return (
      <div className="flex flex-col pb-1 mx-1">
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("jellyfin.no_active")}</span>
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
        <SingleSessionEntry
          playCommand={(currentSession, command) => handlePlayCommand(currentSession, command)}
          session={session}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      {playing.map((session) => (
        <SessionEntry
          key={session.Id}
          playCommand={(currentSession, command) => handlePlayCommand(currentSession, command)}
          session={session}
        />
      ))}
    </div>
  );
}
