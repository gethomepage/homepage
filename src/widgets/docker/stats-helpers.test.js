import { describe, expect, it } from "vitest";

import { calculateCPUPercent, calculateThroughput, calculateUsedMemory } from "./stats-helpers";

describe("widgets/docker/stats-helpers", () => {
  it("calculateCPUPercent returns 0 when deltas are not positive", () => {
    expect(
      calculateCPUPercent({
        cpu_stats: { cpu_usage: { total_usage: 100 }, system_cpu_usage: 1000, online_cpus: 2 },
        precpu_stats: { cpu_usage: { total_usage: 100 }, system_cpu_usage: 1000 },
      }),
    ).toBe(0);
  });

  it("calculateCPUPercent computes percent and rounds to 1 decimal", () => {
    // cpuDelta=100, systemDelta=1000, cpus=2 => (100/1000)*2*100 = 20.0
    expect(
      calculateCPUPercent({
        cpu_stats: { cpu_usage: { total_usage: 200 }, system_cpu_usage: 2000, online_cpus: 2 },
        precpu_stats: { cpu_usage: { total_usage: 100 }, system_cpu_usage: 1000 },
      }),
    ).toBe(20);
  });

  it("calculateUsedMemory subtracts inactive file (prefers total_inactive_file)", () => {
    const stats = {
      memory_stats: {
        usage: 1000,
        total_inactive_file: 100,
        stats: { inactive_file: 200 },
      },
    };
    expect(calculateUsedMemory(stats)).toBe(900);
  });

  it("calculateUsedMemory falls back to stats.inactive_file when total_inactive_file missing", () => {
    const stats = {
      memory_stats: {
        usage: 1000,
        stats: { inactive_file: 200 },
      },
    };
    expect(calculateUsedMemory(stats)).toBe(800);
  });

  it("calculateThroughput uses the special networks.network key when present", () => {
    const stats = { networks: { network: { rx_bytes: 5, tx_bytes: 6 }, eth0: { rx_bytes: 1, tx_bytes: 2 } } };
    expect(calculateThroughput(stats)).toEqual({ rxBytes: 5, txBytes: 6 });
  });

  it("calculateThroughput sums all interfaces otherwise", () => {
    const stats = { networks: { eth0: { rx_bytes: 1, tx_bytes: 2 }, eth1: { rx_bytes: 3, tx_bytes: 4 } } };
    expect(calculateThroughput(stats)).toEqual({ rxBytes: 4, txBytes: 6 });
  });
});
