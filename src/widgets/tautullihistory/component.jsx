/* eslint-disable camelcase */
import { useTranslation } from "next-i18next";
import { DateTime } from "luxon";
import { useState, useMemo } from "react";
import { BiCircle, BiSolidCircle, BiSolidCircleHalf, BiSolidCircleQuarter, BiSolidCircleThreeQuarter } from "react-icons/bi";
import classNames from "classnames";

import Container from "components/services/widget/container";
import MillisecondsToString from "utils/media/timeToString"
import PlatformIcon from "utils/media/platformIcon";
import PlayStatusIcon from "utils/media/playStatusIcon";
import useWidgetAPI from "utils/proxy/use-widget-api";

function RecordEntry({ record }) {
  const [hover, setHover] = useState(false);
  const { i18n } = useTranslation();
  const { full_title, platform, player, play_duration, stopped, transcode_decision, friendly_name, watched_status } = record;

  const stoppedDate = DateTime.fromSeconds(stopped);
  const key = `record-${full_title}-${stoppedDate}-${friendly_name}`;

  // Requires setHover in each section since hover changes the right hand side
  return (
    <div className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
      <div 
        className="flex"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        key={key}>
        <div className="text-xs z-10 self-center ml-1 mr-1 h-4 grow">
          <div className="w-10 z-10 self-center overflow-hidden justify-start">{stoppedDate.setLocale(i18n.language).toLocaleString({ month: "short", day: "numeric" })}</div>
        </div>
        {platform && <PlatformIcon platform={platform.toLowerCase()} opacity="opacity-70"/>}
        <div className="text-xs z-10 self-center ml-1.5 h-4 grow mr-1">
          <div className="w-20 z-10 self-center overflow-hidden justify-start">{friendly_name}</div>
        </div>
      </div>
      <div className="z-10 self-center ml-1 relative w-full h-4 grow mr-1">
          {!hover && friendly_name !== "unknown" && 
            <div
              className="absolute text-xs w-full whitespace-nowrap text-ellipsis overflow-hidden"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              key={key}>{full_title}</div>
          }
          {hover && friendly_name !== "unknown" &&
            <div 
              className="absolute text-xs w-full flex whitespace-nowrap text-ellipsis overflow-hidden"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              key={key}>
              <div className="w-5 self-center justify-start">
                <PlayStatusIcon videoDecision={transcode_decision} audioDecision={transcode_decision} opacity="opacity-70"/>
              </div>
              <div className="self-center ml-1 whitespace-nowrap text-ellipsis overflow-hidden">{player}</div>
              <div className="grow "/>
              <div className="self-center text-xs justify-end mr-0.5 pl-1">{play_duration && MillisecondsToString(play_duration * 1000)}</div>
              <div className="self-center flex justify-end mr-0.5 pl-0.5">
                <div className="text-base"><BiCircle className="opacity-40"/></div>
                <div className="absolute self-center">
                  {watched_status === 0.25  && 
                    <div className="text-xs mr-0.5"><BiSolidCircleQuarter className="opacity-60"/></div>}
                  {watched_status === 0.5 && 
                    <div className="text-xs mr-0.5"><BiSolidCircleHalf className="opacity-60"/></div>}
                  {watched_status === 0.75 && 
                    <div className="text-xs mr-0.5"><BiSolidCircleThreeQuarter className="opacity-60"/></div>}
                  {watched_status === 1 && 
                    <div className="text-xs mr-0.5"><BiSolidCircle className="opacity-60"/></div>}
                </div>
              </div>
            </div>
          }
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const maxItems = widget?.maxItems ?? 10;

  // params for API fetch
  const params = useMemo(() => {
    const constructedParams = {
      include_activity: 0,
      length: "",
    };

    constructedParams.length = maxItems;

    return constructedParams;
  }, [maxItems]);

  const { data: historyData, error: historyError } = useWidgetAPI(widget, "get_history", { ...params });
  
  if (historyError || (historyData && Object.keys(historyData.response.data).length === 0)) {
    return <Container service={service} error={historyError ?? { message: t("tautulli.plex_connection_error") }} />;
  }

  if (!historyData || historyData.response.data.data.length === 0) {
    return (
      <div className={classNames("flex flex-col", (!historyData || historyData.response.data.data.length === 0) && "animate-pulse")}>
        <div className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px]">{t("tautullihistory.no_history")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-1 mx-1">
      { historyData.response.data.data.map((record) => (
        <RecordEntry 
          key={`record-entry-${record.full_title}-${record.user}-${record.stopped}`}
          record={record} 
        />
      ))}
    </div>
  );
}
