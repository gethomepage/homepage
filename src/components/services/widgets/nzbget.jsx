import useSWR from "swr";
import { JSONRPCClient } from "json-rpc-2.0";

import { formatBytes } from "utils/stats-helpers";

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
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Nzbget API Error</div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="flex flex-row w-full">
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">RATE</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">REMAINING</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">DOWNLOADED</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full">
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{formatBytes(statusData.DownloadRate)}/s</div>
        <div className="font-bold text-xs">RATE</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{Math.round((statusData.RemainingSizeMB / 1024) * 100) / 100} GB</div>
        <div className="font-bold text-xs">REMAINING</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{Math.round((statusData.DownloadedSizeMB / 1024) * 100) / 100} GB</div>
        <div className="font-bold text-xs">DOWNLOADED</div>
      </div>
    </div>
  );
}
