import ugreenProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: ugreenProxyHandler,

  mappings: {
    stats: {
      endpoint: "ugreen/v1/taskmgr/stat/get_all",
      map: (data) => ({
        cpu: data.data?.overview?.cpu?.[0]?.used_percent,
        cpuTemp: data.data?.overview?.cpu?.[0]?.temp,
        mem: data.data?.overview?.mem?.[0]?.used_percent,
        netRx: data.data?.net?.series?.[0]?.recv_rate,
        netTx: data.data?.net?.series?.[0]?.send_rate,
        diskRead: data.data?.disk?.series?.[0]?.read_rate,
        diskWrite: data.data?.disk?.series?.[0]?.write_rate,
        cpuFan: data.data?.overview?.cpu_fan?.[0]?.speed,
        deviceFans: data.data?.overview?.device_fan,
        diskTemps: data.data?.disk?.series?.slice(1)?.map((d) => ({
          name: d.name,
          temp: d.temperature,
        })),
      }),
    },
    status: {
      endpoint: "ugreen/v1/desktop/components/data?id=desktop.component.SystemStatus",
      map: (data) => ({
        uptime: data.data?.total_run_time,
        serverStatus: data.data?.server_status,
        devName: data.data?.dev_name,
      }),
    },
    storage: {
      endpoint: "ugreen/v1/storage/pool/list",
      map: (data) => {
        const pools = data.data?.result ?? [];
        return pools.map((pool) => ({
          name: pool.name,
          label: pool.label,
          level: pool.level,
          status: pool.status,
          total: pool.total,
          used: pool.used,
          free: pool.free,
        }));
      },
    },
  },
};

export default widget;
