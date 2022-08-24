import useSWR from "swr";

export default function Emby({ service }) {
  const config = service.widget;

  function buildApiUrl(endpoint) {
    const { url, key } = config;
    return `${url}/emby/${endpoint}?api_key=${key}`;
  }

  const { data: sessionsData, error: sessionsError } = useSWR(buildApiUrl(`Sessions`), {
    refreshInterval: 1000,
  });

  if (sessionsError) {
    return (
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">Emby API Error</div>
      </div>
    );
  }

  if (!sessionsData) {
    return (
      <div className="flex flex-row w-full">
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">PLAYING</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">TRANSCODE</div>
        </div>
        <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
          <div className="font-thin text-sm">-</div>
          <div className="font-bold text-xs">BITRATE</div>
        </div>
      </div>
    );
  }

  const playing = sessionsData.filter((session) => session.hasOwnProperty("NowPlayingItem"));
  const transcoding = sessionsData.filter(
    (session) => session.hasOwnProperty("PlayState") && session.PlayState.PlayMethod === "Transcode"
  );
  const bitrate = playing.reduce((acc, session) => acc + session.NowPlayingItem.Bitrate, 0);

  return (
    <div className="flex flex-row w-full">
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{playing.length}</div>
        <div className="font-bold text-xs">PLAYING</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{transcoding.length}</div>
        <div className="font-bold text-xs">TRANSCODE</div>
      </div>
      <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
        <div className="font-thin text-sm">{Math.round((bitrate / 1024 / 1024) * 100) / 100} Mbps</div>
        <div className="font-bold text-xs">BITRATE</div>
      </div>
    </div>
  );
}
