export function calculateCPUPercent(stats) {
  let cpuPercent = 0.0;
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

  if (systemDelta > 0.0 && cpuDelta > 0.0) {
    cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0;
  }

  return Math.round(cpuPercent * 10) / 10;
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat(bytes / k ** i).toFixed(dm)} ${sizes[i]}`;
}

export function formatBits(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat(bytes / k ** i).toFixed(dm)} ${sizes[i]}`;
}
