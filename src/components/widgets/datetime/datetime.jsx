import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

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
  const { text_size: textSize, format } = options;
  const { i18n } = useTranslation();
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [setDate]);

  const dateFormat = new Intl.DateTimeFormat(i18n.language, { ...format });

  return (
    <div className="flex flex-row items-center grow justify-end">
      <span className={`text-theme-800 dark:text-theme-200 ${textSizes[textSize || "lg"]}`}>
        {dateFormat.format(date)}
      </span>
    </div>
  );
}
