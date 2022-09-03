import useSWR from "swr";

import Widget from "../widget";
import Block from "../block";

export default function Npm({ service }) {
  const config = service.widget;
  const { url } = config;

  const fetcher = async (reqUrl) => {
    const { url, username, password } = config;
    const loginUrl = `${url}/api/tokens`;
    const body = { identity: username, secret: password };

    const res = await fetch(loginUrl, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(
        async (data) =>
          await fetch(reqUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + data.token,
            },
          })
      );
    return res.json();
  };

  const { data: infoData, error: infoError } = useSWR(`${url}/api/nginx/proxy-hosts`, fetcher);

  console.log(infoData);

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
