import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Portainer({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, env } = config;
    const reqUrl = new URL(`/api/endpoints/${env}/${endpoint}`, url);
    return `/api/proxy?url=${encodeURIComponent(reqUrl)}`;
  }

  const fetcher = async (url) => {
    const res = await fetch(url, {
      method: "GET",
      withCredentials: true,
      credentials: "include",
      headers: {
        "X-API-Key": `${config.key}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  const { data: containersData, error: containersError } = useSWR(buildApiUrl(`docker/containers/json`), fetcher);

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
