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

  const options = {};
  if (ua) {
    options.headers = {
      "User-Agent": ua,
    };
  }
  const [, , data] = await httpProxy(url, options);
  cache.put(url, data, duration * 1000 * 60);
  return data;
}
