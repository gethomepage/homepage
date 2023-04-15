import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import classNames from "classnames";

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

export default function DateTime({ options }) {
  const { text_size: textSize, locale, format } = options;
  const { i18n } = useTranslation();
  const [date, setDate] = useState("");
  const dateLocale = locale ?? i18n.language;

  useEffect(() => {
    const dateFormat = new Intl.DateTimeFormat(dateLocale, { ...format });
    const interval = setInterval(() => {
      setDate(dateFormat.format(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, [date, setDate, dateLocale, format]);

  return (
    <div className={classNames(
      "flex flex-col justify-center first:ml-0 ml-4",
      options?.styleBoxed === true && " mt-2 m:mb-0 rounded-md shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 dark:bg-white/5 p-3",
    )}>
      <div className="flex flex-row items-center grow justify-end">
        <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${textSizes[textSize || "lg"]}`}>
          {date}
        </span>
      </div>
    </div>
  );
}
