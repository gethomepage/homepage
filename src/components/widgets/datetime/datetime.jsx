import { useTranslation } from "next-i18next/pages";
import { useMemo } from "react";

import Container from "../widget/container";
import Raw from "../widget/raw";

import useCurrentTime from "utils/hooks/use-current-time";

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
  const dateLocale = locale ?? i18n.language;
  const currentTime = useCurrentTime(1000);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(dateLocale, { ...format }), [dateLocale, format]);
  const date = currentTime === null ? "" : dateFormatter.format(new Date(currentTime));

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
