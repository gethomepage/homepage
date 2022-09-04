import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Ombi({ service }) {
  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatApiUrl(config, `Request/count`));

  if (statsError) {
    return <Widget error="Ombi API Error" />;
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
