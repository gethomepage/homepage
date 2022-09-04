import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Sonarr({ service }) {
  const config = service.widget;

  const { data: wantedData, error: wantedError } = useSWR(formatApiUrl(config, "wanted/missing"));
  const { data: queuedData, error: queuedError } = useSWR(formatApiUrl(config, "queue"));
  const { data: seriesData, error: seriesError } = useSWR(formatApiUrl(config, "series"));

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
