import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/api/{endpoint}",
  proxyHandler: credentialedProxyHandler,
  mappings: {
    collection: {
      endpoint: "collections/media/{collectionId}/content/1",
    }
  }
};

export default widget;
