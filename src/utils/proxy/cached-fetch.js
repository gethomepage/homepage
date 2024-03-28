import cache from "memory-cache";

const defaultDuration = 5;

export default async function cachedFetch(url, duration, ua) {
  const cached = cache.get(url);

  // eslint-disable-next-line no-param-reassign
  duration = duration || defaultDuration;

  if (cached) {
    return cached;
  }

  // wrapping text in JSON.parse to handle utf-8 issues
  const options = {};
  if (ua) {
    options.headers = {
      "User-Agent": ua,
    };
  }
  const data = await fetch(url, options).then((res) => res.json());
  cache.put(url, data, duration * 1000 * 60);
  return data;
}
