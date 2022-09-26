import cache from "memory-cache";

export default async function cachedFetch(url, duration) {
  const cached = cache.get(url);

  if (cached) {
    return cached;
  }

  const data = await fetch(url).then((res) => res.json());
  cache.put(url, data, duration * 1000 * 60);
  return data;
}
