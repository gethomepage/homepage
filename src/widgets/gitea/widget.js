import genericProxyHandler from "utils/proxy/handlers/generic";

// Get total from header to avoid pagination limit
export function totalCount(data, headers) {
  const count = parseInt(headers?.["x-total-count"], 10);
  return { count: Number.isNaN(count) ? null : count };
}

const widget = {
  api: "{url}/api/v1/{endpoint}?access_token={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    notifications: {
      endpoint: "notifications?limit=1",
      map: totalCount,
    },
    issues: {
      endpoint: "repos/issues/search?type=issues&limit=1",
      map: totalCount,
    },
    pulls: {
      endpoint: "repos/issues/search?type=pulls&limit=1",
      map: totalCount,
    },
    repositories: {
      endpoint: "repos/search?limit=1",
      map: totalCount,
    },
  },
};

export default widget;
