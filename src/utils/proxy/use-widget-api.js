import useSWR from "swr";

import { formatProxyUrl } from "./api-helpers";

export default function useWidgetAPI(widget, ...options) {
  const config = {};
  if (options?.refreshInterval) {
    config.refreshInterval = options.refreshInterval;
  }
  const { data, error } = useSWR(formatProxyUrl(widget, ...options), config);
  // make the data error the top-level error
  return { data, error: data?.error ?? error }
}
