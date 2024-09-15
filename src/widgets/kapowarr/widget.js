import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/volumes/stats?api_key={key}",
  proxyHandler: genericProxyHandler,
};

export default widget;
