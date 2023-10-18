import useSWR from "swr";
import { t } from "i18next";

export default function KubernetesStatus({ service, style }) {
  const podSelectorString = service.podSelector !== undefined ? `podSelector=${service.podSelector}` : "";
  const { data, error } = useSWR(`/api/kubernetes/status/${service.namespace}/${service.app}?${podSelectorString}`);

  let statusLabel = t("docker.unknown");
  let statusTitle = "";
  let backgroundClass = "px-1.5 py-0.5 bg-theme-500/10 dark:bg-theme-900/50";
  let colorClass = "text-black/20 dark:text-white/40 opacity-20";

  if (error) {
    statusTitle = t("docker.error");
    statusLabel = statusTitle;
    colorClass = "text-rose-500/80";
  } else if (data) {
    if (data.status === "running") {
      statusTitle = data.health ?? data.status;
      statusLabel = statusTitle;
      colorClass = "text-emerald-500/80";
    }

    if (data.status === "not found" || data.status === "down" || data.status === "partial") {
      statusTitle = data.status;
      statusLabel = statusTitle;
      colorClass = "text-orange-400/50 dark:text-orange-400/80";
    }
  }

  if (style === "dot") {
    colorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
    backgroundClass = "p-4 hover:bg-theme-500/10 dark:hover:bg-theme-900/20";
  }

  return (
    <div
      className={`w-auto text-center overflow-hidden ${backgroundClass} rounded-b-[3px] k8s-status`}
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
