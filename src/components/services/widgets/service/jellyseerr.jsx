import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Jellyseerr({ service }) {
  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatApiUrl(config, `request/count`));

  if (statsError) {
    return <Widget error="Jellyseerr API Error" />;
  }

  if (!statsData) {
    return (
      <Widget>
        <Block label="Pending" />
        <Block label="Approved" />
        <Block label="Available" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="Pending" value={statsData.pending} />
      <Block label="Approved" value={statsData.approved} />
      <Block label="Available" value={statsData.available} />
    </Widget>
  );
}
