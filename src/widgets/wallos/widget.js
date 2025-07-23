import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "{url}/api/{endpoint}.php?apiKey={key}",
  proxyHandler: genericProxyHandler,

  mappings: {
    "subscriptions/get_monthly_cost": {
      endpoint: "subscriptions/get_monthly_cost",
      validate: [
        "localized_monthly_cost",
        "currency_symbol"
      ],
      params: [
        "month",
        "year"
      ],
    },
  },
};

export default widget;
