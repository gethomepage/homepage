import { DateTime } from "luxon";
import classNames from "classnames";
import { useTranslation } from "next-i18next";

import Event, { compareDateTimezone } from "./event";

export default function Agenda({ service, colorVariants, events, showDate }) {
  const { widget } = service;
  const { t } = useTranslation();

  if (!showDate) {
    return <div className=" text-center" />;
  }

  const eventsArray = Object.keys(events)
    .filter(
      (eventKey) =>
        showDate.minus({ days: widget?.previousDays ?? 0 }).startOf("day").ts <=
        events[eventKey].date?.startOf("day").ts,
    )
    .map((eventKey) => events[eventKey])
    .sort((a, b) => a.date - b.date)
    .slice(0, widget?.maxEvents ?? 10);

  if (!eventsArray.length) {
    return (
      <div className="text-center">
        <div className="pl-2 pr-2">
          <div className={classNames("flex flex-col", !eventsArray.length && !events.length && "animate-pulse")}>
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
    <div className="pl-1 pr-1 pb-1">
      <div className={classNames("flex flex-col", !eventsArray.length && !events.length && "animate-pulse")}>
        {eventsByDay.map((eventsDay, i) => (
          <div key={days[i]}>
            {eventsDay.map((event, j) => (
              <Event
                key={`event-agenda-${event.title}-${event.date}-${event.additional}`}
                event={event}
                colorVariants={colorVariants}
                showDate={j === 0}
                showTime={widget?.showTime && compareDateTimezone(showDate, event)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
