import { useState } from "react";
import classNames from "classnames";

export default function RestartButton({ containerName, server, onRestart }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleRestart = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const params = server ? [containerName, server] : [containerName];
      const res = await fetch(`/api/docker/restart/${params.join("/")}`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Restart failed");
      }

      setSuccess(true);
      onRestart?.();
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRestart}
      disabled={loading}
      className={classNames(
        "flex items-center gap-1 px-2 py-1 text-xs rounded transition-all",
        "text-theme-500 dark:text-theme-400 hover:text-red-500 dark:hover:text-red-400",
        "border border-theme-300 dark:border-theme-600 hover:border-red-400 dark:hover:border-red-500",
        "hover:bg-red-50 dark:hover:bg-red-900/20",
        loading && "opacity-50 cursor-not-allowed",
        success && "text-green-500 border-green-400 bg-green-50 dark:bg-green-900/20",
        error && "text-red-500 border-red-400"
      )}
      title={`Restart ${containerName}`}
    >
      {loading ? (
        <>
          <div className="w-3 h-3 border border-theme-300 border-t-theme-600 rounded-full animate-spin" />
          <span>Restarting...</span>
        </>
      ) : success ? (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Restarted</span>
        </>
      ) : error ? (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="truncate max-w-[100px]">{error}</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Restart</span>
        </>
      )}
    </button>
  );
}