import truenasProxyHandler from "utils/proxy/handlers/truenas";

/**
 * TrueNAS Widget Configuration
 * 
 * Supports both TrueNAS CORE (REST API) and TrueNAS SCALE (WebSocket JSON-RPC)
 * 
 * Configuration in services.yaml:
 *   - useWebsocket: true  -> Use JSON-RPC over WebSocket (SCALE 25.04+)
 *   - useWebsocket: false -> Use REST API (CORE, legacy SCALE)
 * 
 * TrueNAS deprecated REST API in 25.04 and will remove it in 26.04.
 * See: https://www.truenas.com/docs/api/
 */
const widget = {
  api: "{url}/api/v2.0/{endpoint}",
  proxyHandler: truenasProxyHandler,

  mappings: {
    alerts: {
      endpoint: "alert/list",
      map: (data) => ({
        // NOTE: Using native Array.filter() instead of jsonArrayFilter
        // WebSocket returns parsed JavaScript objects, not text needing JSON.parse()
        // jsonArrayFilter is designed for REST API responses (text data)
        pending: Array.isArray(data) ? data.filter((item) => item?.dismissed === false).length : 0,
      }),
    },
    status: {
      endpoint: "system/info",
    },
    pools: {
      endpoint: "pool",
      map: (data) => ({
        total: data?.reduce((acc, pool) => acc + pool.size, 0),
        used: data?.reduce((acc, pool) => acc + pool.allocated, 0),
      }),
    },
    dataset: {
      endpoint: "pool/dataset",
      map: (data) => ({
        total: data?.reduce((acc, dataset) => acc + dataset.available + dataset.used, 0),
        used: data?.reduce((acc, dataset) => acc + dataset.used, 0),
      }),
    },
  },
};

export default widget;