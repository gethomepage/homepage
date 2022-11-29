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
  const dateFormat = new Intl.DateTimeFormat(i18n.language, { ...format });
  const [date, setDate] = useState("");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dateFormat.format(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, [date, setDate, dateFormat]);

  return (
    <div className="flex flex-col justify-center first:ml-0 ml-4">
      <div className="flex flex-row items-center grow justify-end">
        <span className={`text-theme-800 dark:text-theme-200 ${textSizes[textSize || "lg"]}`}>
          {date}
        </span>
      </div>
    </div>
  );
}
