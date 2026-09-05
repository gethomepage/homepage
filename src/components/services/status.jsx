import { useTranslation } from "next-i18next/pages";
import useSWR from "swr";

const WARNING_CLASS = "text-orange-400/50 dark:text-orange-400/80";

// docker container states other than running
const STATE_LABELS = {
  created: "docker.created",
  dead: "docker.dead",
  exited: "docker.exited",
  "not found": "docker.not_found",
  paused: "docker.paused",
  removing: "docker.removing",
  restarting: "docker.restarting",
};

// states that mean something is wrong rather than merely not started
const WARNING_STATES = new Set(["dead", "exited", "not found", "restarting"]);

export default function Status({ service, style }) {
  const { t } = useTranslation();

  const { data: response, error } = useSWR(`/api/docker/statuses?server=${encodeURIComponent(service.server || "")}`);
  const statusError = error ?? response?.error;
  const { statuses } = response ?? {};
  const data = statuses ? (statuses[service.container] ?? { status: "not found" }) : undefined;

  let statusLabel = t("docker.unknown");
  let backgroundClass = "px-1.5 py-0.5 bg-theme-500/10 dark:bg-theme-900/50";
  let colorClass = "text-black/20 dark:text-white/40 ";

  if (statusError) {
    statusLabel = t("docker.error");
    colorClass = "text-rose-500/80";
  } else if (data?.status?.includes("running")) {
    colorClass = "text-emerald-500/80";

    if (!data.health) {
      statusLabel = data.status.replace("running", t("docker.running"));
    } else {
      statusLabel = data.health === "healthy" ? t("docker.healthy") : data.health;

      if (data.health === "starting") {
        statusLabel = t("docker.starting");
        colorClass = "text-blue-500/80";
      }

      if (data.health === "unhealthy") {
        statusLabel = t("docker.unhealthy");
        colorClass = WARNING_CLASS;
      }
    }
  } else if (data?.status?.startsWith("partial")) {
    statusLabel = data.status.replace("partial", t("docker.partial"));
    colorClass = WARNING_CLASS;
  } else if (data && STATE_LABELS[data.status]) {
    statusLabel = t(STATE_LABELS[data.status]);
    if (WARNING_STATES.has(data.status)) colorClass = WARNING_CLASS;
  }

  if (style === "dot") {
    colorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
    backgroundClass = "p-4 hover:bg-theme-500/10 dark:hover:bg-theme-900/20";
  }

  return (
    <div
      className={`w-auto text-center overflow-hidden ${backgroundClass} rounded-b-[3px] docker-status docker-status-${statusLabel
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
