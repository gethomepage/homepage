import useSWR from "swr";
import { FiHardDrive } from "react-icons/fi";
import { BiError } from "react-icons/bi";
import { useTranslation } from "next-i18next";

import UsageBar from "./usage-bar";

export default function Disk({ options, expanded }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=disk&target=${options.disk}`, {
    refreshInterval: 1500,
  });

  if (error || data?.error) {
    return (
      <div className="flex-none flex flex-row items-center mr-3 py-1.5">
        <BiError className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-xs">{t("widget.api_error")}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-none flex flex-row items-center mr-3 py-1.5 animate-pulse">
        <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left min-w-[85px]">
          <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">-</div>
            <div className="pr-1">{t("resources.free")}</div>
          </span>
          {expanded && (
            <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
              <div className="pl-0.5">-</div>
              <div className="pr-1">{t("resources.total")}</div>
            </span>
          )}
          <UsageBar percent={0} />
        </div>
      </div>
    );
  }

  const percent = Math.round((data.drive.usedGb / data.drive.totalGb) * 100);

  return (
    <div className="flex-none flex flex-row items-center mr-3 py-1.5">
      <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left min-w-[85px]">
        <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
          <div className="pl-0.5">{t("common.bytes", { value: data.drive.freeGb * 1024 * 1024 * 1024 })}</div>
          <div className="pr-1">{t("resources.free")}</div>
        </span>
        {expanded && (
          <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">{t("common.bytes", { value: data.drive.totalGb * 1024 * 1024 * 1024 })}</div>
            <div className="pr-1">{t("resources.total")}</div>
          </span>
        )}
        <UsageBar percent={percent} />
      </div>
    </div>
  );
}
