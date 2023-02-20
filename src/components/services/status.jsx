import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function Status({ service }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/docker/status/${service.container}/${service.server || ""}`);

  if (error) {
    <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden" title={data.status}>
      <div className="text-[8px] font-bold text-rose-500/80 uppercase">{t("docker.error")}</div>
    </div>
  }

  if (data && data.status?.includes("running")) {
    if (data.health === "starting") {
      return (
        <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden" title={data.health}>
          <div className="text-[8px] font-bold text-blue-500/80 uppercase">{data.health}</div>
        </div>
      );
    }

    if (data.health === "unhealthy") {
      return (
        <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden" title={data.health}>
          <div className="text-[8px] font-bold text-orange-400/50 dark:text-orange-400/80 uppercase">{data.health}</div>
        </div>
      );
    }

    return (
      <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden" title={data.health || data.status}>
        <div className="text-[8px] font-bold text-emerald-500/80 uppercase">{data.health || data.status}</div>
      </div>
    );
  }

  if (data && (data.status === "not found" || data.status === "exited" || data.status?.startsWith("partial"))) {
    return (
      <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden" title={data.status}>
        <div className="text-[8px] font-bold text-orange-400/50 dark:text-orange-400/80 uppercase">{data.status}</div>
      </div>
    );
  }

  return (
    <div className="w-auto px-1.5 py-0.5 text-center bg-theme-500/10 dark:bg-theme-900/50 rounded-b-[3px] overflow-hidden">
      <div className="text-[8px] font-bold text-black/20 dark:text-white/40 uppercase">{t("docker.unknown")}</div>
    </div>
  );
}
