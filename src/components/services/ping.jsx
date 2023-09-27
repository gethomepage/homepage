import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function Ping({ group, service, style }) {
  const { t } = useTranslation();
  const { data, error } = useSWR(`/api/ping?${new URLSearchParams({ group, service }).toString()}`, {
    refreshInterval: 30000
  });

  if (error) {
    return (
      <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden ping-error">
        <div className="text-[8px] font-bold text-rose-500 uppercase">{t("ping.error")}</div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden ping-ping">
        <div className="text-[8px] font-bold text-black/20 dark:text-white/40 uppercase">{t("ping.ping")}</div>
      </div>
    );
  }

  let statusText = `HTTP status ${data.status}`;
  let status;

  if (data.status > 403) {
    if (style === "basic") {
      status = t("docker.offline")
    } else if (style === "dot") {
      status = "◉"
    } else {
      status = data.status
    }

    return (
      <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden ping-status-invalid" title={statusText}>
        <div className="text-[8px] font-bold text-rose-500/80 uppercase">{status}</div>
      </div>
    );
  }

  // Sucessful ping
  const ping = t("common.ms", { value: data.latency, style: "unit", unit: "millisecond", maximumFractionDigits: 0 })

  statusText += ` (${ping})`;

  if (style === "basic") {
    status = t("docker.running")
  } else if (style === "dot") {
    status = "◉"
  } else {
    status = ping
  }

  return (
    <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden ping-status-valid" title={statusText}>
      <div className="text-[8px] font-bold text-emerald-500/80 uppercase">{status}</div>
    </div>
  );
}
