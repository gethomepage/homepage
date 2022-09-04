import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Traefik({ service }) {
  const config = service.widget;

  const { data: traefikData, error: traefikError } = useSWR(formatApiUrl(config, "overview"));

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
