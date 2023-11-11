import { useContext, useState } from "react";
import { DateTime } from "luxon";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import { EventContext } from "../../utils/contexts/calendar";

export function Event({ event, colorVariants, showDate = false }) {
  const [hover, setHover] = useState(false);
  const { i18n } = useTranslation();

  return (
    <div
      className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs text-left h-5 rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1"
      onMouseEnter={() => setHover(!hover)}
      onMouseLeave={() => setHover(!hover)}
    >
      <span className="ml-2 w-10">
        <span>
          {showDate &&
            event.date.setLocale(i18n.language).startOf("day").toLocaleString({ month: "short", day: "numeric" })}
        </span>
      </span>
      <span className="ml-2 h-2 w-2">
        <span className={classNames("block w-2 h-2 rounded", colorVariants[event.color] ?? "gray")} />
      </span>
      <div className="ml-2 h-5 text-left relative truncate" style={{ width: "70%" }}>
        <div className="absolute mt-0.5 text-xs">{hover && event.additional ? event.additional : event.title}</div>
      </div>
      {event.isCompleted && (
        <span className="text-xs mr-1 ml-auto z-10">
          <IoMdCheckmarkCircleOutline />
        </span>
      )}
    </div>
  );
}

export default function Agenda({ service, colorVariants, showDate }) {
  const { widget } = service;
  const { events } = useContext(EventContext);
  const { t } = useTranslation();

  if (!showDate) {
    return <div className=" text-center" />;
  }

  const eventsArray = Object.keys(events)
    .filter(
      (eventKey) => showDate.startOf("day").toUnixInteger() <= events[eventKey].date?.startOf("day").toUnixInteger(),
    )
    .map((eventKey) => events[eventKey])
    .sort((a, b) => a.date - b.date)
    .slice(0, widget?.maxEvents ?? 10);

  if (!eventsArray.length) {
    return (
      <div className="text-center">
        <div className="p-2 ">
          <div
            className={classNames("flex flex-col pt-1 pb-1", !eventsArray.length && !events.length && "animate-pulse")}
          >
            <Event
              key="no-event"
              event={{
                title: t("calendar.noEventsToday"),
                date: DateTime.now(),
                color: "gray",
              }}
              colorVariants={colorVariants}
            />
          </div>
        </div>
      </div>
    );
  }

  const days = Array.from(new Set(eventsArray.map((e) => e.date.startOf("day").ts)));
  const eventsByDay = days.map((d) => eventsArray.filter((e) => e.date.startOf("day").ts === d));

  return (
    <div className="p-2">
      <div className={classNames("flex flex-col pt-1 pb-1", !eventsArray.length && !events.length && "animate-pulse")}>
        {eventsByDay.map((eventsDay, i) => (
          <div key={days[i]}>
            {eventsDay.map((event, j) => (
              <Event
                key={`event${event.title}-${event.date}`}
                event={event}
                colorVariants={colorVariants}
                showDate={j === 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
