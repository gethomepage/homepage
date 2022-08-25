import useSWR from "swr";
import { JSONRPCClient } from "json-rpc-2.0";

import { formatBytes } from "utils/stats-helpers";

import Widget from "../widget";
import Block from "../block";

export default function Nzbget({ service }) {
  const config = service.widget;

  const constructedUrl = new URL(config.url);
  constructedUrl.pathname = "jsonrpc";

  const client = new JSONRPCClient((jsonRPCRequest) =>
    fetch(constructedUrl.toString(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${btoa(`${config.username}:${config.password}`)}`,
      },
      body: JSON.stringify(jsonRPCRequest),
    }).then(async (response) => {
      if (response.status === 200) {
        const jsonRPCResponse = await response.json();
        return client.receive(jsonRPCResponse);
      } else if (jsonRPCRequest.id !== undefined) {
        return Promise.reject(new Error(response.statusText));
      }
    })
  );

  const { data: statusData, error: statusError } = useSWR(
    "status",
    (resource) => {
      return client.request(resource).then((response) => response);
    },
    {
      refreshInterval: 1000,
    }
  );

  if (statusError) {
    return <Widget error="Nzbget API Error" />;
  }

  if (!statusData) {
    return (
      <Widget>
        <Block label="Rate" />
        <Block label="Remaining" />
        <Block label="Downloaded" />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label="Rate" value={`${formatBytes(statusData.DownloadRate)}/s`} />
      <Block label="Remaining" value={`${Math.round((statusData.RemainingSizeMB / 1024) * 100) / 100} GB`} />
      <Block label="Downloaded" value={`${Math.round((statusData.DownloadedSizeMB / 1024) * 100) / 100} GB`} />
    </Widget>
  );
}
