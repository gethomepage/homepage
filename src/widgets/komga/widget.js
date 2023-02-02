import genericProxyHandler from "utils/proxy/handlers/generic";
import { jsonArrayFilter } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v1/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    libraries: {
      endpoint: "libraries",
      map: (data) => ({
        total: jsonArrayFilter(data, (item) => !item.unavailable).length,
      }),
    },
    series: {
      endpoint: "series",
      validate: [
        "totalElements"
      ]
    },
    books: {
      endpoint: "books",
      validate: [
        "totalElements"
      ]
    },
  },
};

export default widget;