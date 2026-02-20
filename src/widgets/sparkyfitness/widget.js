import sparkyfitnessProxyHandler from "./proxy";

const widget = {
  type: 'sparkyfitness',
  name: 'Sparky Fitness',
  icon: 'mdi-lightning-bolt',
  api: "{url}/{endpoint}",
  proxyHandler: sparkyfitnessProxyHandler,
  endpoint: 'api/dashboard/stats',
  props: {
    key: {
      label: 'API Key',
      type: 'password',
    },
  },
  mappings: {
    stats: {
      endpoint: 'api/dashboard/stats',
    },
  },
};

export default widget;
