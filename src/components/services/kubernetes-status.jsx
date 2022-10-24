import useSWR from "swr";

export default function KubernetesStatus({ service }) {
  const { data, error } = useSWR(`/api/kubernetes/status/${service.namespace}/${service.app}`);

  if (error) {
    return <div className="w-3 h-3 bg-rose-300 dark:bg-rose-500 rounded-full" />;
  }

  if (data && data.status === "running") {
    return <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-500 rounded-full" />;
  }

  if (data && data.status === "not found") {
    return <div className="h-2.5 w-2.5 bg-orange-400/50 dark:bg-yellow-200/40 -rotate-45" />;
  }

  return <div className="w-3 h-3 bg-black/20 dark:bg-white/40 rounded-full" />;
}
