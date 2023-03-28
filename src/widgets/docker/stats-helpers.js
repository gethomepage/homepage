export function calculateCPUPercent(stats) {
  let cpuPercent = 0.0;
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

  if (systemDelta > 0.0 && cpuDelta > 0.0) {
    cpuPercent = (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100.0;
  }

  return Math.round(cpuPercent * 10) / 10;
}

export function calculateUsedMemory(stats) {
  return stats.memory_stats.usage - stats.memory_stats.stats.cache
}