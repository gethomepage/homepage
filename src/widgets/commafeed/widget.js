import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
    api: "{url}/rest/{endpoint}",
    proxyHandler: credentialedProxyHandler,

    mappings: {
        counters: {
            endpoint: "category/get?id=all",
            map: (data) => {
                const calculateUnread = (category) => {
                    let count = 0;
                    if (category.feeds) {
                        count += category.feeds.reduce((acc, feed) => acc + (feed.unread || 0), 0);
                    }
                    if (category.children) {
                        count += category.children.reduce((acc, child) => acc + calculateUnread(child), 0);
                    }
                    return count;
                };

                return {
                    unread: calculateUnread(asJson(data)),
                };
            },
        },
    },
};

export default widget;
