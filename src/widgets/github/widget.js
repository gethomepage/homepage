import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://api.github.com/repos/{owner}/{repo}",
  proxyHandler: credentialedProxyHandler,
};

export default widget;
