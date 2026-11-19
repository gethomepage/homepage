// Throw on non-OK responses (e.g. a 401 from an auth proxy after its session expires) so SWR
// keeps the last good data instead of replacing the dashboard arrays with an error body.
// Every useSWR call for /api/services, /api/bookmarks and /api/widgets must use this fetcher,
// because SWR shares one cache entry per key.
export default async function dashboardFetcher(resource, init) {
  const res = await fetch(resource, init);
  if (!res.ok) {
    throw new Error(`Request to ${resource} failed with status ${res.status}`);
  }
  return res.json();
}
