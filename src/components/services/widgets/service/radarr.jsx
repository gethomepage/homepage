import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Radarr({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, key } = config;
    return `${url}/api/v3/${endpoint}?apikey=${key}`;
  }

  const { data: moviesData, error: moviesError } = useSWR(buildApiUrl("movie"));
  const { data: queuedData, error: queuedError } = useSWR(buildApiUrl("queue/status"));

  if (moviesError || queuedError) {
    return <Widget error="Radarr API Error" />;
  }

  if (!moviesData || !queuedData) {
    return (
      <Widget>
        <Block label="Wanted" />
        <Block label="Queued" />
        <Block label="Movies" />
      </Widget>
    );
  }

  const wanted = moviesData.filter((movie) => movie.isAvailable === false);
  const have = moviesData.filter((movie) => movie.isAvailable === true);

  return (
    <Widget>
      <Block label="Wanted" value={wanted.length} />
      <Block label="Queued" value={queuedData.totalCount} />
      <Block label="Movies" value={moviesData.length} />
    </Widget>
  );
}
