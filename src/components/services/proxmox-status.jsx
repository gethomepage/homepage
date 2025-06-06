import { useTranslation } from "next-i18next";
import useSWR from "swr";

export default function ProxmoxStatus({ service, style }) {
  const { t } = useTranslation();

  const vmType = service.proxmoxType || "qemu";
  const apiUrl = `/api/proxmox/stats/${service.proxmoxNode}/${service.proxmoxVMID}?type=${vmType}`;

  const { data, error } = useSWR(apiUrl);

  let statusLabel = t("docker.unknown");
  let backgroundClass = "px-1.5 py-0.5 bg-theme-500/10 dark:bg-theme-900/50";
  let colorClass = "text-black/20 dark:text-white/40 ";

  if (error) {
    statusLabel = t("docker.error");
    colorClass = "text-rose-500/80";
  } else if (data) {
    if (data.status === "running") {
      statusLabel = t("docker.running");
      colorClass = "text-emerald-500/80";
    }

    if (data.status === "stopped") {
      statusLabel = t("docker.exited");
      colorClass = "text-orange-400/50 dark:text-orange-400/80";
    }

    if (data.status === "paused") {
      statusLabel = "paused";
      colorClass = "text-blue-500/80";
    }

    if (data.status === "offline") {
      statusLabel = "offline";
      colorClass = "text-orange-400/50 dark:text-orange-400/80";
    }

    if (data.status === "not found") {
      statusLabel = t("docker.not_found");
      colorClass = "text-orange-400/50 dark:text-orange-400/80";
    }
  }

  if (style === "dot") {
    colorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
    backgroundClass = "p-4 hover:bg-theme-500/10 dark:hover:bg-theme-900/20";
  }

  return (
    <div
      className={`w-auto text-center overflow-hidden ${backgroundClass} rounded-b-[3px] proxmoxstatus proxmoxstatus-${statusLabel
        .toLowerCase()
        .replace(" ", "-")}`}
      title={statusLabel}
    >
      {style !== "dot" ? (
        <div className={`text-[8px] font-bold ${colorClass} uppercase`}>{statusLabel}</div>
      ) : (
        <div className={`rounded-full h-3 w-3 ${colorClass}`} />
      )}
    </div>
  );
}
