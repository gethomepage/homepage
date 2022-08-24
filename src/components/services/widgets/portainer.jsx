import useSWR from "swr";

export default function Portainer({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, env } = config;
    const reqUrl = new URL(`/api/endpoints/${env}/${endpoint}`, url);
    return `/api/proxy?url=${encodeURIComponent(reqUrl)}`;
  }

  const fetcher = (url) => {
    return fetch(url, {
      method: "GET",
      withCredentials: true,
      credentials: "include",
      headers: {
        "X-API-Key": `${config.key}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };

  const { data: containersData, error: containersError } = useSWR(buildApiUrl(`docker/containers/json`), fetcher);

  if (containersError) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Portainer API Error</div>
      </div>
    );
  }

  if (!containersData) {
    return (
      <div className="flex flex-row w-full">
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">RUNNING</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">STOPPED</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">TOTAL</div>
        </div>
      </div>
    );
  }

  if (containersData.error) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Portainer API Error</div>
      </div>
    );
  }

  const running = containersData.filter((c) => c.State === "running").length;
  const stopped = containersData.filter((c) => c.State === "exited").length;
  const total = containersData.length;

  return (
    <div className="flex flex-row w-full">
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{running}</div>
        <div className="font-bold text-xs">RUNNING</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{stopped}</div>
        <div className="font-bold text-xs">STOPPED</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{total}</div>
        <div className="font-bold text-xs">TOTAL</div>
      </div>
    </div>
  );
}
