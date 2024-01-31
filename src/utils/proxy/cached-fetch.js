import cache from "memory-cache";

const defaultDuration = 5;

export default async function cachedFetch(url, duration) {
  const cached = cache.get(url);

  // eslint-disable-next-line no-param-reassign
  duration = duration || defaultDuration;

  if (cached) {
    return cached;
  }

  const data = await fetch(url).then((res) => res.json());
  cache.put(url, data, duration * 1000 * 60);
  return data;
}
