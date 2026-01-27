import useSWR from "swr";

export default function BingWallpaperInfo() {
  const { data } = useSWR("/api/bing", {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 3600000, // Refresh every hour
  });

  if (!data || data.error) {
    return null;
  }

  // Extract text before parenthesis for cleaner display
  const copyrightText = data.copyright ? data.copyright.split("(")[0].trim() : "";

  return (
    <div id="bg_info" className="flex flex-col items-end gap-1 mb-4">
      {data.title && (
        <div id="bg_title" className="text-theme-800 dark:text-theme-300 text-xl font-medium">{data.title}</div>
      )}
      {copyrightText && (
        <div id="bg_copyright" className="text-xs text-theme-500 dark:text-theme-400">
          {data.copyrightlink ? (
            <a href={data.copyrightlink} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {copyrightText}
            </a>
          ) : (
            copyrightText
          )}
        </div>
      )}
    </div>
  );
}
