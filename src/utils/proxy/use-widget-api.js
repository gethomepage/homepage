import useSWR from "swr";

import { formatProxyUrl } from "./api-helpers";

export default function useWidgetAPI(widget, ...options) {
  const config = {};
  if (options && options[1]?.refreshInterval) {
    config.refreshInterval = options[1].refreshInterval;
  }
  const { data, error, mutate } = useSWR(formatProxyUrl(widget, ...options), config);
  // make the data error the top-level error
  return { data, error: data?.error ?? error, mutate }
}
