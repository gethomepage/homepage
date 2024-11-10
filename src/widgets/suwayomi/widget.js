// import genericProxyHandler from "utils/proxy/handlers/generic";
import suwayomiProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/graphql",
  proxyHandler: suwayomiProxyHandler,
};

export default widget;
