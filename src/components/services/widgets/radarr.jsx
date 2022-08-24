import useSWR from "swr";

export default function Radarr({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, key } = config;
    return `${url}/api/v3/${endpoint}?apikey=${key}`;
  }

  const { data: moviesData, error: moviesError } = useSWR(buildApiUrl("movie"));

  const { data: queuedData, error: queuedError } = useSWR(
    buildApiUrl("queue/status")
  );

  if (moviesError || queuedError) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Radarr API Error</div>
      </div>
    );
  }

  if (!moviesData || !queuedData) {
    return (
      <div className="flex flex-row w-full">
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">WANTED</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">QUEUED</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">MOVIES</div>
        </div>
      </div>
    );
  }

  const wanted = moviesData.filter((movie) => movie.isAvailable === false);
  const have = moviesData.filter((movie) => movie.isAvailable === true);

  return (
    <div className="flex flex-row w-full">
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{wanted.length}</div>
        <div className="font-bold text-xs">WANTED</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{queuedData.totalCount}</div>
        <div className="font-bold text-xs">QUEUED</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{moviesData.length}</div>
        <div className="font-bold text-xs">MOVIES</div>
      </div>
    </div>
  );
}
