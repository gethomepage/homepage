import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { asJson, jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
