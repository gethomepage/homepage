import useSWR from "swr";
import { FaRegClock } from "react-icons/fa";
import { BiError } from "react-icons/bi";
import { useTranslation } from "next-i18next";

export default function Uptime() {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/widgets/resources?type=uptime`, {
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
        <FaRegClock className="text-theme-800 dark:text-theme-200 w-5 h-5" />
        <div className="flex flex-col ml-3 text-left min-w-[85px]">
          <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
            <div className="pl-0.5">-</div>
            <div className="pr-1">{t("resources.temp")}</div>
          </span>
        </div>
      </div>
    );
  }

  const mo = Math.floor(data.uptime / (3600 * 24 * 31));
  const d = Math.floor(data.uptime % (3600 * 24 * 31) / (3600 * 24));
  const h = Math.floor(data.uptime % (3600 * 24) / 3600);
  const m = Math.floor(data.uptime % 3600 / 60);
  
  let uptime;
  if (mo > 0) uptime = `${mo}${t("resources.months")} ${d}${t("resources.days")}`;
  else if (d > 0) uptime = `${d}${t("resources.days")} ${h}${t("resources.hours")}`;
  else uptime = `${h}${t("resources.hours")} ${m}${t("resources.minutes")}`;

  return (
    <div className="flex-none flex flex-row items-center mr-3 py-1.5">
      <FaRegClock className="text-theme-800 dark:text-theme-200 w-5 h-5" />
      <div className="flex flex-col ml-3 text-left min-w-[85px]">
        <span className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between">
          <div className="pl-0.5">
            {uptime}
          </div>
          <div className="pr-1">{t("resources.uptime")}</div>
        </span>
      </div>
    </div>
  );
}
