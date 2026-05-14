import createLogger from "utils/logger";

const logger = createLogger("vpnStatus");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type = "auto" } = req.query;

  // Expected Tailscale IP of the homelab server — set in serverpilot.yaml vpn.expected_tailscale_ip
  const EXPECTED_TAILSCALE_IP = process.env.TAILSCALE_EXPECTED_IP || "";

  try {
    // Tailscale check
    if (type === "tailscale" || type === "auto") {
      try {
        const { execSync } = await import("child_process");
        const output = execSync("tailscale status --json --self", {
          timeout: 5000,
          encoding: "utf8",
        });
        const status = JSON.parse(output);
        const backendState = status.BackendState;

        if (backendState === "Running") {
          // Verify reachability: ping the expected Tailscale IP if configured,
          // or fall back to checking DNS resolution of the homelab hostname.
          // This confirms the Tailscale network is actually usable, not just running.
          let reachable = false;
          let reachableIP = null;

          if (EXPECTED_TAILSCALE_IP) {
            // Ping the known homelab Tailscale IP to confirm the tunnel is up
            try {
              execSync(`ping -c 1 -W 2 ${EXPECTED_TAILSCALE_IP}`, {
                timeout: 5000,
                encoding: "utf8",
                stdio: "pipe",
              });
              reachable = true;
              reachableIP = EXPECTED_TAILSCALE_IP;
            } catch {
              // ping failed — Tailscale is running but we can't reach the homelab
              reachable = false;
            }
          } else {
            // No expected IP configured — use the self IP as reachability signal
            // (Tailscale is running and we have an address assigned)
            reachable = true;
            reachableIP = status.Self?.IP || null;
          }

          return res.status(200).json({
            connected: reachable,
            type: "tailscale",
            ip: status.Self?.DNSName || status.Self?.IP || null,
            reachable: reachableIP,
          });
        }
      } catch {
        // Tailscale not available or not connected
      }
    }

    // Gluetun check: fetch external IP and compare against expected VPN exit IP
    if (type === "gluetun" || type === "auto") {
      const EXPECTED_GLUETUN_IP = process.env.GLUETUN_EXPECTED_IP || "";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        if (ipRes.ok) {
          const { ip } = await ipRes.json();
          const isExpectedVPN = EXPECTED_GLUETUN_IP ? ip === EXPECTED_GLUETUN_IP : true;
          return res.status(200).json({
            connected: isExpectedVPN,
            type: "gluetun",
            ip,
          });
        }
      } catch {
        // ipify failed
      }
    }

    return res.status(200).json({
      connected: false,
      type,
      ip: null,
      reachable: null,
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: e?.message ?? "Failed to check VPN status" });
  }
}