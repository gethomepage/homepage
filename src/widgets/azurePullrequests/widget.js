import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests",
  proxyHandler: credentialedProxyHandler,
};

// mappings: {
//   "v1/cryptocurrency/quotes/latest": {
//     endpoint: "v1/cryptocurrency/quotes/latest",
//     params: ["convert"],
//     optionalParams: ["symbol", "slug"],
//   },

export default widget;
