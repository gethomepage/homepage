import { useTranslation } from "react-i18next";
import useSWR from "swr";

export default function Status({ service, style }) {
  const { t } = useTranslation();

  const { data, error } = useSWR(`/api/docker/status/${service.container}/${service.server || ""}`);

  let statusLabel = t("docker.unknown");
  let statusTitle = "";
  let backgroundClass = "px-1.5 py-0.5 bg-theme-500/10 dark:bg-theme-900/50";
  let colorClass = "text-black/20 dark:text-white/40 ";

  if (error) {
    statusTitle = t("docker.error");
    colorClass = "text-rose-500/80";
  } else if (data) {
    if (data.status?.includes("running")) {
      if (data.health === "starting") {
        statusTitle = t("docker.starting");
        colorClass = "text-blue-500/80";
      }

      if (data.health === "unhealthy") {
        statusTitle = t("docker.unhealthy");
        colorClass = "text-orange-400/50 dark:text-orange-400/80";
      }

      if (!data.health) {
        statusLabel = data.status.replace("running", t("docker.running"));
      } else {
        statusLabel = data.health === "healthy" ? t("docker.healthy") : data.health;
      }

      statusTitle = statusLabel;
      colorClass = "text-emerald-500/80";
    }

    if (data.status === "not found" || data.status === "exited" || data.status?.startsWith("partial")) {
      if (data.status === "not found") statusLabel = t("docker.not_found");
      else if (data.status === "exited") statusLabel = t("docker.exited");
      else statusLabel = data.status.replace("partial", t("docker.partial"));
      colorClass = "text-orange-400/50 dark:text-orange-400/80";
    }
  }

  if (style === "dot") {
    colorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
    backgroundClass = "p-4 hover:bg-theme-500/10 dark:hover:bg-theme-900/20";
    statusTitle = statusLabel;
  }

  return (
    <div
      className={`w-auto text-center overflow-hidden ${backgroundClass} rounded-b-[3px] docker-status`}
      title={statusTitle}
    >
      {style !== "dot" ? (
        <div className={`text-[8px] font-bold ${colorClass} uppercase`}>{statusLabel}</div>
      ) : (
        <div className={`rounded-full h-3 w-3 ${colorClass}`} />
      )}
    </div>
  );
}
