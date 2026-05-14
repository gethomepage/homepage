import { useState, useEffect } from "react";
import classNames from "classnames";

export default function ServerRestartButton({ sshKeyPath, sshUser = "ubuntu" }) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Timer ref to track the countdown interval
  const countdownRef = useRef(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, []);

  const handleRestart = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/server/restart", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Restart failed");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setConfirmOpen(false);
      }, 2000);
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = () => {
    setConfirmOpen(true);
    setCountdown(5);
    // Clear any existing interval first
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <>
      <button
        type="button"
        onClick={openConfirm}
        className={classNames(
          "flex items-center gap-1 px-2 py-1 text-xs rounded transition-all",
          "text-theme-500 dark:text-theme-400 hover:text-orange-500 dark:hover:text-orange-400",
          "border border-theme-300 dark:border-theme-600 hover:border-orange-400 dark:hover:border-orange-500"
        )}
        title="Restart server"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Reboot</span>
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-theme-100 dark:bg-theme-900 rounded-lg shadow-xl w-80 p-6">
            <h3 className="text-lg font-medium text-theme-700 dark:text-theme-200 mb-2">
              Restart server?
            </h3>
            <p className="text-sm text-theme-500 mb-4">
              This will restart the entire server. All services will be unavailable until the reboot completes.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm text-orange-500">
                Restarting in {countdown}s
              </span>
            </div>
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            {success && <p className="text-sm text-green-500 mb-3">Restarting...</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-3 py-1.5 text-sm text-theme-500 hover:text-theme-700 dark:hover:text-theme-300 border border-theme-300 dark:border-theme-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestart}
                disabled={loading || countdown > 0}
                className={classNames(
                  "px-3 py-1.5 text-sm text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors",
                  (loading || countdown > 0) && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? "Restarting..." : `Reboot Now`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}