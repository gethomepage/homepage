import { useEffect, useRef, useState } from "react";
import classNames from "classnames";

export default function IframeTab({ tab, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [height, setHeight] = useState(600);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      // Handle iframe resize messages
      if (event.data?.type === "serverpilot-iframe-height") {
        setHeight(event.data.height);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    // Try to auto-detect iframe height
    try {
      const iframe = iframeRef.current?.contentWindow;
      if (iframe) {
        iframe.postMessage({ type: "serverpilot-request-height" }, "*");
      }
    } catch {
      // Cross-origin — can't communicate
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-theme-50 dark:bg-theme-900 border-b border-theme-200 dark:border-theme-700">
        <div className="flex items-center gap-2">
          {tab.favicon && (
            <img src={tab.favicon} alt="" className="w-4 h-4 rounded-sm" />
          )}
          <span className="text-sm font-medium text-theme-700 dark:text-theme-200">{tab.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const win = window.open(tab.url, "_blank");
              win?.focus();
            }}
            className="px-2 py-1 text-xs text-theme-500 hover:text-theme-700 dark:hover:text-theme-300 border border-theme-300 dark:border-theme-600 rounded transition-colors"
          >
            Open in new tab
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs text-theme-400 hover:text-theme-600 dark:hover:text-theme-300"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-theme-50 dark:bg-theme-900">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-theme-300 border-t-theme-600 rounded-full animate-spin" />
              <span className="text-xs text-theme-400">Loading {tab.title}...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-theme-50 dark:bg-theme-900">
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <p className="text-sm text-theme-500">Cannot embed this page.</p>
              <p className="text-xs text-theme-400">
                This site blocks embedding. Click &quot;Open in new tab&quot; to view it directly.
              </p>
              <button
                type="button"
                onClick={() => window.open(tab.url, "_blank")}
                className="mt-2 px-3 py-1.5 text-sm bg-theme-600 text-white rounded hover:bg-theme-700 transition-colors"
              >
                Open in new tab
              </button>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={tab.url}
          className={classNames(
            "w-full border-0 transition-opacity",
            loaded ? "opacity-100" : "opacity-0"
          )}
          style={{ height }}
          onLoad={handleLoad}
          onError={() => setError(true)}
          title={tab.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}