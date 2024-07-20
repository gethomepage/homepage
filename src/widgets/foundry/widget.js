import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
    api: "{url}/api/status",
    proxyHandler: genericProxyHandler,

    mappings: {
        status: {
            endpoint: "/"
        }
    }
}

export default widget;