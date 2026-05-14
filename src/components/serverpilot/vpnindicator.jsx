import { useState, useEffect } from "react";

export default function VpnIndicator({ type = "auto" }) {
  const [status, setStatus] = useState("checking");
  const [ip, setIp] = useState(null);
  const [reachable, setReachable] = useState(null);
  const [vpnType, setVpnType] = useState(null);

  useEffect(() => {
    const checkVpn = async () => {
      setStatus("checking");
      try {
        const statusRes = await fetch(`/api/vpn/status?type=${type}`);
        if (statusRes.ok) {
          const data = await statusRes.json();
          setVpnType(data.type);
          setIp(data.ip);
          setReachable(data.reachable ?? null);

          if (data.connected && data.reachable) {
            setStatus("connected");
          } else if (data.connected && !data.reachable) {
            setStatus("unreachable");
          } else {
            setStatus("disconnected");
          }
        } else {
          setStatus("disconnected");
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
    connected: { color: "bg-green-400", label: vpnType === "tailscale" ? "Tailscale OK" : "VPN Active" },
    unreachable: { color: "bg-yellow-400", label: "Tailscale on — homelab unreachable" },
    disconnected: { color: "bg-red-400", label: "No VPN" },
    error: { color: "bg-gray-400", label: "Unknown" },
  };

  const config = statusConfig[status] || statusConfig.checking;

  return (
    <div className="flex items-center gap-1.5 text-xs text-theme-500 dark:text-theme-400" title={ip ? `Exit IP: ${ip}${reachable ? ` | Homelab: ${reachable}` : ""}` : ""}>
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span>{config.label}</span>
      {ip && status !== "checking" && (
        <span className="font-mono text-[10px] opacity-60">{ip}</span>
      )}
    </div>
  );
}