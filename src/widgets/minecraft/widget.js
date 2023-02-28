import minecraftProxyHandler from "utils/proxy/handlers/minecraft";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  proxyHandler: minecraftProxyHandler,
  mappings: {
    status: {
      endpoint: "_",
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
