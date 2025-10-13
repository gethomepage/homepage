import classNames from "classnames";
import { useTranslation } from "next-i18next";
import { useContext, useMemo } from "react";

import { evaluateHighlight, getHighlightClass } from "utils/highlights";

import { BlockHighlightContext } from "./highlight-context";

export default function Block({ value, valueRaw, label, field }) {
  const { t } = useTranslation();
  const highlightConfig = useContext(BlockHighlightContext);

  const highlight = useMemo(() => {
    if (!highlightConfig) return null;
    const fieldKey = field || label;
    if (!fieldKey) return null;
    const candidateValue = valueRaw ?? value;
    return evaluateHighlight(fieldKey, candidateValue, highlightConfig);
  }, [field, label, value, valueRaw, highlightConfig]);

  const highlightClass = useMemo(() => {
    if (!highlight?.level) return undefined;
    return getHighlightClass(highlight.level, highlightConfig);
  }, [highlight, highlightConfig]);

  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-center justify-center text-center p-1",
        value === undefined ? "animate-pulse" : "",
        highlightClass,
        "service-block",
      )}
      data-highlight-level={highlight?.level}
      data-highlight-source={highlight?.source}
    >
      <div className="font-thin text-sm">{value === undefined || value === null ? "-" : value}</div>
      <div className="font-bold text-xs uppercase">{t(label)}</div>
    </div>
  );
}
