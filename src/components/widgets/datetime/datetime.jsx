import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

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

export default function DateTime({ options }) {
  const { text_size: textSize, locale, format } = options;
  const { i18n } = useTranslation();
  const [date, setDate] = useState("");
  const dateLocale = locale ?? i18n.language;

  useEffect(() => {
    const dateFormat = new Intl.DateTimeFormat(dateLocale, { ...format });
    setDate(dateFormat.format(new Date()));
    const interval = setInterval(() => {
      setDate(dateFormat.format(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, [date, setDate, dateLocale, format]);

  return (
    <Container options={options} additionalClassNames="information-widget-datetime">
      <Raw>
        <div className="flex flex-row items-center grow justify-end">
          <span className={`text-theme-800 dark:text-theme-200 tabular-nums ${textSizes[textSize || "lg"]}`}>
            {date}
          </span>
        </div>
      </Raw>
    </Container>
  );
}
