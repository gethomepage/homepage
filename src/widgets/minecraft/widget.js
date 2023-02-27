import genericProxyHandler from "utils/proxy/handlers/generic";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/{endpoint}/{domain}",
  proxyHandler: genericProxyHandler,
  mappings: {
    status: {
      endpoint: "2",
      map: (data) => {
        const jsonData = asJson(data);
        return {
          players: jsonData.players,
          version: jsonData.version,
          online: jsonData.online
        }
      }
    }
  }
}

export default widget;
