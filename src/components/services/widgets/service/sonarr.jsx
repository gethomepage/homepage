import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Sonarr({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, key } = config;
    return `${url}/api/v3/${endpoint}?apikey=${key}`;
  }

  const { data: wantedData, error: wantedError } = useSWR(buildApiUrl("wanted/missing"));
  const { data: queuedData, error: queuedError } = useSWR(buildApiUrl("queue"));
  const { data: seriesData, error: seriesError } = useSWR(buildApiUrl("series"));

  if (wantedError || queuedError || seriesError) {
    return <Widget error="Sonar API Error" />;
  }

  if (!wantedData || !queuedData || !seriesData) {
    return (
      <Widget>
        <Block label="Wanted" />
        <Block label="Queued" />
        <Block label="Series" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="Wanted" value={wantedData.totalRecords} />
      <Block label="Queued" value={queuedData.totalRecords} />
      <Block label="Series" value={seriesData.length} />
    </Widget>
  );
}
