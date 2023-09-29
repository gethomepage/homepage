import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function Ping({ group, service, style }) {
  const { t } = useTranslation();
  const { data, error } = useSWR(`/api/ping?${new URLSearchParams({ group, service }).toString()}`, {
    refreshInterval: 30000
  });

  let textSize = "text-[8px]";
  let colorClass = ""
  let backgroundClass = "bg-theme-500/10 dark:bg-theme-900/50";
  let statusTitle = "HTTP status";
  let statusText;

  if (error) {
    colorClass = "text-rose-500"
    statusText = t("ping.error")
    statusTitle += " error"
  } else if (!data) {
    colorClass = "text-black/20 dark:text-white/40"
    statusText = t("ping.ping")
    statusTitle += " not available"
  } else if (data.status > 403) {
    colorClass = "text-rose-500/80"
    statusTitle += ` ${data.status}`

    if (style === "basic") {
      statusText = t("docker.offline")
    } else if (style === "dot") {
      statusText = "◉"
      textSize = "text-[14px]"
      backgroundClass = ""
    } else {
      statusText = data.status
    }
  } else {
    const ping = t("common.ms", { value: data.latency, style: "unit", unit: "millisecond", maximumFractionDigits: 0 })
    statusTitle += ` ${data.status} (${ping})`;
    colorClass = "text-emerald-500/80"

    if (style === "basic") {
      statusText = t("docker.running")
    } else if (style === "dot") {
      statusText = "◉"
      textSize = "text-[14px]"
      backgroundClass = ""
    } else {
      statusText = ping
    }
  }

  return (
    <div className={`w-auto px-1.5 py-0.5 text-center rounded-b-[3px] overflow-hidden ping-status-invalid ${backgroundClass}`} title={statusTitle}>
      <div className={`font-bold uppercase ${textSize} ${colorClass}`}>{statusText}</div>
    </div>
  );
}
