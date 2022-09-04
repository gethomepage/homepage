import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Portainer({ service }) {
  const config = service.widget;

  const { data: containersData, error: containersError } = useSWR(formatApiUrl(config, `docker/containers/json?all=1`));

  if (containersError) {
    return <Widget error="Portainer API Error" />;
  }

  if (!containersData) {
    return (
      <Widget>
        <Block label="Running" />
        <Block label="Stopped" />
        <Block label="Total" />
      </Widget>
    );
  }

  if (containersData.error) {
    return <Widget error="Portainer API Error" />;
  }

  const running = containersData.filter((c) => c.State === "running").length;
  const stopped = containersData.filter((c) => c.State === "exited").length;
  const total = containersData.length;

  return (
    <Widget>
      <Block label="Running" value={running} />
      <Block label="Stopped" value={stopped} />
      <Block label="Total" value={total} />
    </Widget>
  );
}
