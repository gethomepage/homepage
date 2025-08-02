import { useContext } from "react";
import classNames from "classnames";
import { useTranslation } from "next-i18next";

import { HideContext } from "../../../utils/contexts/hide";
import { maskSensitiveData, isSensitiveField } from "../../../utils/sensitive-data";

export default function Block({ value, label, disableHide = false }) {
  const { t } = useTranslation();
  const { hideSensitive } = useContext(HideContext);

  // Determine if this field should be hidden based on label or content
  const shouldMask = !disableHide && (isSensitiveField(label) || isSensitiveField(String(value || "")));
  const displayValue = shouldMask ? maskSensitiveData(value, hideSensitive) : value;

  return (
    <div
      className={classNames(
        "bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-center justify-center text-center p-1",
        value === undefined ? "animate-pulse" : "",
        "service-block",
      )}
    >
      <div className="font-thin text-sm">{displayValue === undefined || displayValue === null ? "-" : displayValue}</div>
      <div className="font-bold text-xs uppercase">{t(label)}</div>
    </div>
  );
}
