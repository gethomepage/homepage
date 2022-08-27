import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Traefik({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url } = config;
    const fullUrl = `${url}/api/${endpoint}`;
    return `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
  }

  const { data: traefikData, error: traefikError } = useSWR(buildApiUrl("overview"));

  if (traefikError) {
    return <Widget error="Traefik API Error" />;
  }

  if (!traefikData) {
    return (
      <Widget>
        <Block label="Routers" />
        <Block label="Services" />
        <Block label="Middleware" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="Routers" value={traefikData.http.routers.total} />
      <Block label="Services" value={traefikData.http.services.total} />
      <Block label="Middleware" value={traefikData.http.middlewares.total} />
    </Widget>
  );
}
