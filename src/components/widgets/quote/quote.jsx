import { useState } from "react";
import useSWR from "swr";

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

export default function DailyQuote({ options }) {
  const { text_size: textSize, width } = options;
  const [quote, setQuote] = useState(null);

  useSWR("https://api.quotable.io/random", {
    onSuccess: (data) => {
      setQuote(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  if (!quote) {
    return null;
  }

  const textClass = `quote-content ${textSizes[textSize || "lg"]} text-theme-800 dark:text-theme-200`;
  const wrapperStyle = { width };

  return (
    <div className="flex flex-col justify-center ml-4" style={wrapperStyle}>
      <div className={textClass}>
        &ldquo;{quote.content}&rdquo;
      </div>
      <div className="quote-author">{quote.author}</div>
    </div>
  );
}
