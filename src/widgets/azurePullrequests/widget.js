import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests?{filter}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    pr: {
      filter: "",
      map: (data) => ({
        count: asJson(data).count,
      }),
    },
    myPr: {
      filter: "searchCriteria.creatorId={creatorId}&",
      map: (data) => ({
        count: asJson(data).count,
      }),
    },
  },
};


export default widget;
