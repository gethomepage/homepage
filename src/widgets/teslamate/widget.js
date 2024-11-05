import genericProxyHandler from "utils/proxy/handlers/generic";
import { asJson } from "utils/proxy/api-helpers";

const widget = {
  api: "{url}/api/v1/cars/{car_id}/{endpoint}",
  proxyHandler: genericProxyHandler,

  mappings: {
    status: {
      endpoint: "status",
      map: (data) => ({
        car_name: asJson(data).data.car.car_name,
        odometer: asJson(data).data.status.odometer,
        battery_level: asJson(data).data.status.battery_details.battery_level,
      }),
    },
  },
};

export default widget;
