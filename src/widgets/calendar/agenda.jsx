import { useContext, useState } from "react";
import { DateTime } from "luxon";
import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import { EventContext } from "../../utils/contexts/calendar";

export function Event({ event, colorVariants, i18n }) {
  const title = event.title.length > 42 ? `${event.title.slice(0, 42)}...` : event.title;
  const [hover, setHover] = useState(false);

  return (
    <div
      key={title}
      className="flex flex-row text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1"
      onMouseEnter={() => setHover(!hover)}
      onMouseLeave={() => setHover(!hover)}
    >
      <span className="inline-flex items-center ml-2 w-10">
        <span>
          {event.date.setLocale(i18n.language).startOf("day").toLocaleString({ month: "short", day: "numeric" })}
        </span>
      </span>
      <span className="inline-flex items-center">
        <span
          key={event.date.toLocaleString() + event.color + title}
          className={classNames("inline-flex h-2 w-2 m-1.5 rounded", colorVariants[event.color] ?? "gray")}
        />
      </span>
      <span className="inline-flex flex-auto left-1 text-left text-xs mt-[2px] truncate text-ellipsis overflow-hidden visible">
        {hover && event.additional ? event.additional : title}
      </span>
      {event.isCompleted && (
        <span className="text-xs mr-1 mt-1 z-10">
          <IoMdCheckmarkCircleOutline />
        </span>
      )}
    </div>
  );
}

export default function Agenda({ service, colorVariants, showDate }) {
  const { widget } = service;
  const { events } = useContext(EventContext);
  const { i18n } = useTranslation();
  const currentDate = DateTime.now();

  if (!showDate) {
    return <div className="w-full text-center" />;
  }

  const eventsArray = Object.keys(events)
    .filter(
      (eventKey) => showDate.startOf("day").toUnixInteger() <= events[eventKey].date?.startOf("day").toUnixInteger(),
    )
    .map((eventKey) => events[eventKey])
    .sort((a, b) => a.date - b.date)
    .slice(0, widget?.maxEvents ?? 10);

  return (
    <div className="w-full text-center">
      <div className="p-2 w-full">
        <div
          className={classNames("flex flex-col pt-1 pb-1", !eventsArray.length && !events.length && "animate-pulse")}
        >
          {eventsArray?.map((event) => (
            <Event key={`event${event.title}-${event.date}`} event={event} colorVariants={colorVariants} i18n={i18n} />
          ))}
          {!eventsArray?.length && (
            <Event
              key="no-event"
              event={{
                title: `No events for today!`,
                date: currentDate,
                color: "gray",
              }}
              colorVariants={colorVariants}
              i18n={i18n}
            />
          )}
        </div>
      </div>
    </div>
  );
}
