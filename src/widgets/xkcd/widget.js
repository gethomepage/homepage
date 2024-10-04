import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
    api: "https://xkcd.com/info.0.json", // Correct URL (2024): https://xkcd.com/info.0.json
    proxyHandler: genericProxyHandler,
};

export default widget;