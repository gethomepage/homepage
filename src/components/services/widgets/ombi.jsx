import useSWR from "swr";

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

  const { data: statsData, error: statsError } = useSWR(
    buildApiUrl(`Request/count`),
    fetcher
  );

  if (statsError) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Ombi API Error</div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="flex flex-row w-full">
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">COMPLETED</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">QUEUED</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">TOTAL</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full">
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{statsData.pending}</div>
        <div className="font-bold text-xs">PENDING</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{statsData.approved}</div>
        <div className="font-bold text-xs">APPROVED</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{statsData.available}</div>
        <div className="font-bold text-xs">AVAILABLE</div>
      </div>
    </div>
  );
}
