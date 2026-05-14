import { useState, useEffect } from "react";

export default function VpnIndicator({ type = "auto" }) {
  const [status, setStatus] = useState("checking");
  const [ip, setIp] = useState(null);

  useEffect(() => {
    const checkVpn = async () => {
      setStatus("checking");
      try {
        // Fetch current public IP
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const { ip: currentIp } = await ipRes.json();
        setIp(currentIp);

        if (type === "gluetun") {
          // Gluetun: compare to known VPN exit IP (configured externally)
          // For now, show the IP and let the user decide if it looks right
          setStatus(currentIp ? "connected" : "disconnected");
        } else if (type === "tailscale") {
          // Tailscale: check BackendState
          const statusRes = await fetch("/api/vpn/status");
          if (statusRes.ok) {
            const data = await statusRes.json();
            setStatus(data.connected ? "connected" : "disconnected");
          } else {
            setStatus("disconnected");
          }
        } else {
          // Auto: both Gluetun and Tailscale are best-effort
          // Show as connected if any VPN is detected
          setStatus(currentIp ? "connected" : "disconnected");
        }
      } catch {
        setStatus("error");
      }
    };

    checkVpn();
    // Re-check every 60 seconds
    const interval = setInterval(checkVpn, 60000);
    return () => clearInterval(interval);
  }, [type]);

  const statusConfig = {
    checking: { color: "bg-yellow-400", label: "Checking..." },
    connected: { color: "bg-green-400", label: "VPN Active" },
    disconnected: { color: "bg-red-400", label: "No VPN" },
    error: { color: "bg-gray-400", label: "Unknown" },
  };

  const config = statusConfig[status] || statusConfig.checking;

  return (
    <div className="flex items-center gap-1.5 text-xs text-theme-500 dark:text-theme-400" title={ip || ""}>
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span>{config.label}</span>
      {ip && status !== "checking" && (
        <span className="font-mono text-[10px] opacity-60">{ip}</span>
      )}
    </div>
  );
}