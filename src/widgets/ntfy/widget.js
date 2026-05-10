import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const noMessages = {
  title: null,
  message: null,
  priority: 3,
  time: null,
  tags: [],
};

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    messages: {
      endpoint: "{topic}/json?poll=1&since=latest",
      allowEmpty: true,
      map: (data) => {
        if (Buffer.isBuffer(data) && data.length === 0) {
          return noMessages;
        }

        return asJson(data);
      },
    },
  },
};

export default widget;
