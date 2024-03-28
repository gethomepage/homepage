import { useState } from "react";
import { useTranslation } from "next-i18next";
import { DateTime } from "luxon";
import classNames from "classnames";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export default function Event({ event, colorVariants, showDate = false, showTime = false, showDateColumn = true }) {
  const [hover, setHover] = useState(false);
  const { i18n } = useTranslation();

  return (
    <div
      className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1"
      onMouseEnter={() => setHover(!hover)}
      onMouseLeave={() => setHover(!hover)}
      key={`event-${event.title}-${event.date}-${event.additional}`}
    >
      {showDateColumn && (
        <span className="ml-2 w-10">
          <span>
            {(showDate || showTime) &&
              event.date
                .setLocale(i18n.language)
                .toLocaleString(showTime ? DateTime.TIME_24_SIMPLE : { month: "short", day: "numeric" })}
          </span>
        </span>
      )}
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
export const compareDateTimezone = (date, event) => date.startOf("day").ts === event.date.startOf("day").ts;
