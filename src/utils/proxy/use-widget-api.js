import useSWR from "swr";

import { formatProxyUrl } from "./api-helpers";

export default function useWidgetAPI(widget, ...options) {
  const config = {};
  if (options && options[1]?.refreshInterval) {
    config.refreshInterval = options[1].refreshInterval;
  }
  let url = formatProxyUrl(widget, ...options);
  if (options[0] === "") {
    url = null;
  }
  const method = (options && options[1]?.method) || "GET";
  const fetcher = async (url) => fetch(url, { method }).then((r) => r.json());
  const { data, error, mutate } = useSWR(url, fetcher, config);
  // make the data error the top-level error
  return { data, error: data?.error ?? error, mutate };
}
