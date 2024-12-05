import racknerdProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: racknerdProxyHandler,

  mappings: {
    serverinfo: {
      endpoint: "api/client/command.php",
      params: ["key", "hash"],
      optionalParams: ["bw", "mem", "hdd", "ipaddr"],
    },
  },
};

export default widget;
