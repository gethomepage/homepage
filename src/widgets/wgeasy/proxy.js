import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";
import createLogger from "utils/logger";

const proxyName = "wgeasyProxyHandler";
const logger = createLogger(proxyName);

export default async function wgeasyProxyHandler(req, res) {
  const { group, service } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {
      const [statusCode, , data] = await httpProxy(
        formatApiCall(widgets[widget.type].api, { ...widget, endpoint: "wireguard/client" }),
        {
          headers: {
            "Content-Type": "application/json",
            authorization: widget.password,
          },
        },
      );

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        // Do nothing
      }

      if (parsedData?.statusCode > 400 || statusCode > 400) {
        logger.error(
          `Error communicating with Wg-Easy. StatusCode: ${
            parsedData?.statusCode ?? statusCode
          }. Data: ${JSON.stringify(parsedData)}`,
        );
        return res
          .status(parsedData?.statusCode ?? statusCode)
          .json({ error: { message: "Error communicating with Wg-Easy", data: parsedData } });
      }

      return res.json(parsedData);
    }
  }

  return res.status(400).json({ error: "Invalid proxy service type" });
}
