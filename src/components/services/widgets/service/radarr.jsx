import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Radarr({ service }) {
  const config = service.widget;

  const { data: moviesData, error: moviesError } = useSWR(formatApiUrl(config, "movie"));
  const { data: queuedData, error: queuedError } = useSWR(formatApiUrl(config, "queue/status"));

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
      <Block label="Movies" value={have.length} />
    </Widget>
  );
}
