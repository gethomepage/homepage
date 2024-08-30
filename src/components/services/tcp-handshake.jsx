import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function TcpHandshake({ group, service, style }) {
  const { t } = useTranslation();
  const { data, error } = useSWR(`/api/tcpHandshake?${new URLSearchParams({ group, service }).toString()}`, {
    refreshInterval: 30000,
  });

  let colorClass = "text-black/20 dark:text-white/40 opacity-20";
  let backgroundClass = "bg-theme-500/10 dark:bg-theme-900/50 px-1.5 py-0.5";
  let statusTitle = t("tcpHandshake.tcp_status");
  let statusText = "";

  if (error || (data && data.error)) {
    colorClass = "text-rose-500";
    statusText = t("tcpHandshake.error");
    statusTitle += ` ${t("tcpHandshake.error")}`;
  } else if (!data) {
    statusText = t("tcpHandshake.response");
    statusTitle += ` ${t("tcpHandshake.not_available")}`;
  } else if (data.status > 403) {
    colorClass = "text-rose-500/80";
    statusTitle += ` ${data.status}`;

    if (style === "basic") {
      statusText = t("tcpHandshake.down");
    } else {
      statusText = data.status;
    }
  } else if (data) {
    const responseTime = t("common.ms", {
      value: data.latency,
      style: "unit",
      unit: "millisecond",
      maximumFractionDigits: 0,
    });
    statusTitle += ` ${data.status} (${responseTime})`;
    colorClass = "text-emerald-500/80";

    if (style === "basic") {
      statusText = t("tcpHandshake.up");
    } else {
      statusText = responseTime;
      colorClass += " lowercase";
    }
  }

  if (style === "dot") {
    backgroundClass = "p-4";
    colorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
  }

  return (
    <div
      className={`w-auto text-center rounded-b-[3px] overflow-hidden site-monitor-status ${backgroundClass}`}
      title={statusTitle}
    >
      {style !== "dot" && <div className={`font-bold uppercase text-[8px] ${colorClass}`}>{statusText}</div>}
      {style === "dot" && <div className={`rounded-full h-3 w-3 ${colorClass}`} />}
    </div>
  );
}
