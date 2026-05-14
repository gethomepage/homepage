import createLogger from "utils/logger";

const logger = createLogger("vpnStatus");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type = "auto" } = req.query;

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
          return res.status(200).json({
            connected: true,
            type: "tailscale",
            ip: status.Self?.DNSName || status.Self?.IP,
          });
        }
      } catch {
        // Tailscale not available or not connected
      }
    }

    // Gluetun check: fetch external IP and compare
    if (type === "gluetun" || type === "auto") {
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        if (ipRes.ok) {
          const { ip } = await ipRes.json();
          return res.status(200).json({
            connected: true,
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
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ error: e?.message ?? "Failed to check VPN status" });
  }
}