import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function Ping({ groupName, serviceName, style }) {
  const { t } = useTranslation();
  const { data, error } = useSWR(`/api/ping?${new URLSearchParams({ groupName, serviceName }).toString()}`, {
    refreshInterval: 30000,
  });

  let colorClass = "text-black/20 dark:text-white/40 opacity-20";
  let backgroundClass = "bg-theme-500/10 dark:bg-theme-900/50 px-1.5 py-0.5";
  let statusTitle = t("ping.ping");
  let statusText = "";

  if (error) {
    colorClass = "text-rose-500";
    statusText = t("ping.error");
    statusTitle += ` ${t("ping.error")}`;
  } else if (!data) {
    statusText = t("ping.ping");
    statusTitle += ` ${t("ping.not_available")}`;
  } else if (!data.alive) {
    colorClass = "text-rose-500/80";
    statusTitle += ` ${t("ping.down")}`;
    statusText = t("ping.down");
  } else if (data.alive) {
    const ping = t("common.ms", { value: data.time, style: "unit", unit: "millisecond", maximumFractionDigits: 0 });
    statusTitle += ` ${t("ping.up")} (${ping})`;
    colorClass = "text-emerald-500/80";

    if (style === "basic") {
      statusText = t("ping.up");
    } else {
      statusText = ping;
      colorClass += " lowercase";
    }
  }

  if (style === "dot") {
    backgroundClass = "p-4";
    colorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
  }

  return (
    <div
      className={`w-auto text-center rounded-b-[3px] overflow-hidden ping-status ${backgroundClass}`}
      title={statusTitle}
    >
      {style !== "dot" && <div className={`font-bold uppercase text-[8px] ${colorClass}`}>{statusText}</div>}
      {style === "dot" && <div className={`rounded-full h-3 w-3 ${colorClass}`} />}
    </div>
  );
}
