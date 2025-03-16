import credentialedProxyHandler from "utils/proxy/handlers/credentialed";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: `{url}/api/v0/{endpoint}`,
  proxyHandler: credentialedProxyHandler,

  mappings: {
    application: {
      endpoint: "application",
      map: (data) => {
        const jsonData = asJson(data);
        return {
          serverStatus: jsonData?.server?.isConnected,
          updateAvailable: jsonData?.version?.isUpdateAvailable,
          filesShared: jsonData?.shares.files,
        };
      },
    },
    downloads: {
      endpoint: "transfers/downloads",
    },
    uploads: {
      endpoint: "transfers/uploads",
    },
  },
};

export default widget;
