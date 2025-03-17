import cache from "memory-cache";

import { httpProxy } from "utils/proxy/http";

const defaultDuration = 5;

export default async function cachedFetch(url, duration, ua) {
  const cached = cache.get(url);

  // eslint-disable-next-line no-param-reassign
  duration = duration || defaultDuration;

  if (cached) {
    return cached;
  }

  const options = {
    headers: {
      "User-Agent": ua ?? "homepage",
      Accept: "application/json",
    },
  };
  let [, , data] = await httpProxy(url, options);
  if (Buffer.isBuffer(data)) {
    try {
      data = JSON.parse(Buffer.from(data).toString());
    } catch (e) {
      console.log("Failed to parse JSON", url, data, Buffer.from(data).toString(), e);
      data = Buffer.from(data).toString();
    }
  }
  cache.put(url, data, duration * 1000 * 60);
  return data;
}
