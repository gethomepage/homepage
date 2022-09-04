import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Npm({ service }) {
  const config = service.widget;

  const { data: infoData, error: infoError } = useSWR(formatApiUrl(config, "nginx/proxy-hosts"));

  if (infoError) {
    return <Widget error="NGINX Proxy Manager API Error" />;
  }

  if (!infoData) {
    return (
      <Widget>
        <Block label="Enabled" />
        <Block label="Disabled" />
        <Block label="Total" />
      </Widget>
    );
  }

  const enabled = infoData.filter((c) => c.enabled === 1).length;
  const disabled = infoData.filter((c) => c.enabled === 0).length;
  const total = infoData.length;

  return (
    <Widget>
      <Block label="Enabled" value={enabled} />
      <Block label="Disabled" value={disabled} />
      <Block label="Total" value={total} />
    </Widget>
  );
}
