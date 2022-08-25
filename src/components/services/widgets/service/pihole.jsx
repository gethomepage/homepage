import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Pihole({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url } = config;
    return `${url}/admin/${endpoint}`;
  }

  const { data: piholeData, error: piholeError } = useSWR(buildApiUrl("api.php"));

  if (piholeError) {
    return <Widget error="PiHole API Error" />;
  }

  if (!piholeData) {
    return (
      <Widget>
        <Block label="Queries" />
        <Block label="Blocked" />
        <Block label="Gravity" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="Queries" value={piholeData.dns_queries_today.toLocaleString()} />
      <Block label="Blocked" value={piholeData.ads_blocked_today.toLocaleString()} />
      <Block label="Gravity" value={piholeData.domains_being_blocked.toLocaleString()} />
    </Widget>
  );
}
