import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import Container from "../widget/container";
import Raw from "../widget/raw";

const textSizes = {
  "4xl": "text-4xl",
  "3xl": "text-3xl",
  "2xl": "text-2xl",
  xl: "text-xl",
  lg: "text-lg",
  md: "text-md",
  sm: "text-sm",
  xs: "text-xs",
};

function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return "";
  const upper = code.toUpperCase();
  return String.fromCodePoint(upper.charCodeAt(0) + 127397, upper.charCodeAt(1) + 127397);
}

function formatTime(timezone, locale, format, showSeconds) {
  try {
    const options = {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: format === "12h",
    };
    if (showSeconds) {
      options.second = "2-digit";
    }
    return new Intl.DateTimeFormat(locale, options).format(new Date());
  } catch (e) {
    return "--:--";
  }
}

function formatDate(timezone, locale, dateFormat) {
  try {
    const options = {
      timeZone: timezone,
      ...dateFormat,
    };
    // Default to short date style if no format provided
    if (!dateFormat || Object.keys(dateFormat).length === 0) {
      options.dateStyle = "short";
    }
    return new Intl.DateTimeFormat(locale, options).format(new Date());
  } catch (e) {
    return "";
  }
}

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
};

export default function WorldClock({ options }) {
  const {
    text_size: textSize = "sm",
    format = "24h",
    show_date: showDate = false,
    show_seconds: showSeconds = false,
    layout = "horizontal",
    columns = 2,
    clocks = [],
    locale,
    date_format: dateFormat,
    date_position: datePosition = "above",
    label_bold: labelBold = true,
    time_bold: timeBold = false,
  } = options;
  const { i18n } = useTranslation();
  const [, setTick] = useState(0);
  const dateLocale = locale ?? i18n.language;

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!clocks || clocks.length === 0) {
    return (
      <Container options={options} additionalClassNames="information-widget-worldclock">
        <Raw>
          <span className="text-theme-500 dark:text-theme-300 text-sm">No clocks configured</span>
        </Raw>
      </Container>
    );
  }

  const isVertical = layout === "vertical";
  const isGrid = layout === "grid";
  const sizeClass = textSizes[textSize] || textSizes.sm;

  const getContainerClass = () => {
    if (isGrid) return `grid ${gridCols[columns] || gridCols[2]} gap-x-4 gap-y-1`;
    if (isVertical) return "flex flex-col gap-1";
    return "flex flex-row flex-wrap items-center gap-x-4 gap-y-1";
  };

  const dateElement = showDate && clocks[0] && (
    <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${sizeClass}`}>
      {formatDate(clocks[0].timezone, dateLocale, dateFormat)}
    </span>
  );

  const clocksElement = (
    <div className={getContainerClass()}>
      {clocks.map((clock, index) => (
        <div
          key={clock.timezone || index}
          className={`flex flex-row items-center gap-1 ${isVertical ? "justify-center" : ""}`}
        >
          {clock.flag && <span>{countryCodeToFlag(clock.flag)}</span>}
          {clock.label && (
            <span className={`text-theme-500 dark:text-theme-300 ${labelBold ? "font-bold" : ""} ${sizeClass}`}>
              {clock.label}
            </span>
          )}
          <span
            className={`text-theme-800 dark:text-theme-200 ${timeBold ? "font-bold" : ""} tabular-nums ${sizeClass}`}
          >
            {formatTime(clock.timezone, dateLocale, format, showSeconds)}
          </span>
        </div>
      ))}
    </div>
  );

  const isRowLayout = datePosition === "left" || datePosition === "right";

  return (
    <Container options={options} additionalClassNames="information-widget-worldclock">
      <Raw>
        <div className={`flex ${isRowLayout ? "flex-row items-center" : "flex-col"} gap-2`}>
          {datePosition === "above" && dateElement}
          {datePosition === "left" && dateElement}
          {clocksElement}
          {datePosition === "right" && dateElement}
          {datePosition === "below" && dateElement}
        </div>
      </Raw>
    </Container>
  );
}
