import freshrssProxyHandler from "./proxy";

const widget = {
  api: "{url}/api/greader.php/{endpoint}?output=json",
  proxyHandler: freshrssProxyHandler,
  mappings: {
    info: {
      endpoint: "/"
    }
  }
};

export default widget;
