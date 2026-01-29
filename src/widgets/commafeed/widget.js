import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/rest/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    counters: {
      endpoint: "category/get?id=all",
      map: (data) => {
        const calculateCounts = (category) => {
          let unread = 0;
          let subscriptions = 0;
          if (category.feeds) {
            subscriptions += category.feeds.length;
            unread += category.feeds.reduce((acc, feed) => acc + (feed.unread || 0), 0);
          }
          if (category.children) {
            category.children.forEach((child) => {
              const childCounts = calculateCounts(child);
              unread += childCounts.unread;
              subscriptions += childCounts.subscriptions;
            });
          }
          return { unread, subscriptions };
        };

        return calculateCounts(asJson(data));
      },
    },
  },
};

export default widget;
