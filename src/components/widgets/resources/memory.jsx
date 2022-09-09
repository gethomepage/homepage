import useSWR from "swr";
import { FaMemory } from "react-icons/fa";
import { BiError } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import UsageBar from "./usage-bar";

export default function Memory() {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=memory`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return (
      <div className="flex-none flex flex-row items-center justify-center">
        <BiError className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-xs">{t("widget.api_error")}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-none flex flex-row items-center justify-center">
        <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-xs">-</span>
        </div>
      </div>
    );
  }

  const percent = Math.round((data.memory.usedMemMb / data.memory.totalMemMb) * 100);

  return (
    <div className="flex-none flex flex-row items-center justify-center group">
      <FaMemory className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left">
        <span className="text-theme-800 dark:text-theme-200 text-xs group-hover:hidden">
          {t("common.bytes", { value: data.memory.freeMemMb * 1024 * 1024 })} {t("resources.free")}
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs hidden group-hover:block">
          {t("common.bytes", { value: data.memory.usedMemMb * 1024 * 1024 })} {t("resources.used")}
        </span>
        <UsageBar percent={percent} />
      </div>
    </div>
  );
}
