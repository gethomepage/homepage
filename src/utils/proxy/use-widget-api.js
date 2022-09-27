import useSWR from "swr";

import { formatProxyUrl } from "./api-helpers";

export default function useWidgetAPI(widget, ...options) {
  return useSWR(formatProxyUrl(widget, ...options));
}
