import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Ombi({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url } = config;
    return `${url}/api/v1/${endpoint}`;
  }

  const fetcher = (url) => {
    return fetch(url, {
      method: "GET",
      withCredentials: true,
      credentials: "include",
      headers: {
        ApiKey: `${config.key}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };

  const { data: statsData, error: statsError } = useSWR(buildApiUrl(`Request/count`), fetcher);

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
