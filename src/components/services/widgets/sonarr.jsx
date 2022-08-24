import useSWR from "swr";

export default function Sonarr({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, key } = config;
    return `${url}/api/v3/${endpoint}?apikey=${key}`;
  }

  const { data: wantedData, error: wantedError } = useSWR(
    buildApiUrl("wanted/missing")
  );

  const { data: queuedData, error: queuedError } = useSWR(buildApiUrl("queue"));

  const { data: seriesData, error: seriesError } = useSWR(
    buildApiUrl("series")
  );

  if (wantedError || queuedError || seriesError) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Sonarr API Error</div>
      </div>
    );
  }

  if (!wantedData || !queuedData || !seriesData) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Loading</div>
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full">
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{wantedData.totalRecords}</div>
        <div className="font-bold text-xs">WANTED</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{queuedData.totalRecords}</div>
        <div className="font-bold text-xs">QUEUED</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{seriesData.length}</div>
        <div className="font-bold text-xs">SERIES</div>
      </div>
    </div>
  );
}
