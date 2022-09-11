import useSWR from "swr";
import { FiHardDrive } from "react-icons/fi";
import { BiError } from "react-icons/bi";
import { useTranslation } from "react-i18next";

import UsageBar from "./usage-bar";

export default function Disk({ options }) {
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
      <div className="flex-none flex flex-row items-center mr-3 py-1.5">
        <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left">
          <span className="text-theme-800 dark:text-theme-200 text-xs">-</span>
        </div>
      </div>
    );
  }

  const percent = Math.round((data.drive.usedGb / data.drive.totalGb) * 100);

  return (
    <div className="flex-none flex flex-row items-center mr-3 py-1.5 group">
      <FiHardDrive className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left min-w-[80px]">
        <span className="text-theme-800 dark:text-theme-200 text-xs group-hover:hidden">
          {t("common.bytes", { value: data.drive.freeGb * 1024 * 1024 * 1024 })} {t("resources.free")}
        </span>
        <span className="text-theme-800 dark:text-theme-200 text-xs hidden group-hover:block">
          {t("common.bytes", { value: data.drive.totalGb * 1024 * 1024 * 1024 })} {t("resources.total")}
        </span>
        <UsageBar percent={percent} />
      </div>
    </div>
  );
}
