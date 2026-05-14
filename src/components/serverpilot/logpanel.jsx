import { useState, useEffect, useRef } from "react";
import classNames from "classnames";

export default function LogPanel({ containerName, server, lines = 100 }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [allContainers, setAllContainers] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState(containerName || null);
  const logsEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const fetchLogs = async (cName, cServer, lineCount = lines, stream = false) => {
    // Close any existing EventSource before creating a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const params = cServer ? [cName, cServer] : [cName];
    const url = `/api/docker/logs/${params.join("/")}?lines=${lineCount}&stream=${stream}`;
    setLoading(true);
    setError(null);

    try {
      if (stream) {
        setStreaming(true);
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          setLogs((prev) => [...prev.slice(-500), event.data]);
        };

        eventSource.onerror = () => {
          eventSource.close();
          eventSourceRef.current = null;
          setStreaming(false);
        };
      } else {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(data.lines || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedContainer) {
      fetchLogs(selectedContainer, server, lines);
    }
  }, [selectedContainer, server, lines]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className={classNames(
      "flex flex-col bg-theme-900 rounded-lg overflow-hidden",
      "border border-theme-700"
    )}>
      <div className="flex items-center justify-between px-3 py-2 bg-theme-800 border-b border-theme-700">
        <div className="flex items-center gap-2">
          <select
            value={selectedContainer || ""}
            onChange={(e) => setSelectedContainer(e.target.value || null)}
            className="text-xs bg-theme-700 text-theme-200 border border-theme-600 rounded px-2 py-1"
          >
            <option value="">Select container</option>
            {allContainers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => selectedContainer && fetchLogs(selectedContainer, server, lines)}
            className="text-xs text-theme-400 hover:text-theme-200 border border-theme-600 rounded px-2 py-1 hover:bg-theme-700 transition-colors"
          >
            Refresh
          </button>
        </div>
        <div className="flex items-center gap-2">
          {streaming && <span className="text-xs text-green-400 animate-pulse">Streaming...</span>}
          <button
            type="button"
            onClick={() => setLogs([])}
            className="text-xs text-theme-500 hover:text-theme-300"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto font-mono text-xs text-theme-300 p-2 h-64">
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-theme-500">
            Loading logs...
          </div>
        ) : error ? (
          <div className="text-red-400 p-2">{error}</div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-theme-500">
            No logs available
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-all">{logs.join("\n")}</pre>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}