import createLogger from "utils/logger";

const logger = createLogger("serverRestart");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validate sshKeyPath is an absolute path with no shell metacharacters
  if (!sshKeyPath || typeof sshKeyPath !== 'string') {
    return res.status(400).json({ error: "SSH key path is required" });
  }
  if (!sshKeyPath.startsWith('/')) {
    return res.status(400).json({ error: "SSH key path must be absolute" });
  }
  // Block shell metacharacters that could enable command injection
  if (/[;&|`$(){}[\]<>\\!?"' \t\n\r]/.test(sshKeyPath)) {
    return res.status(400).json({ error: "SSH key path contains invalid characters" });
  }
  if (/[;&|`$(){}[\]<>\\!?"' \t\n\r]/.test(sshUser)) {
    return res.status(400).json({ error: "SSH user contains invalid characters" });
  }

  try {
    const { execSync } = await import("child_process");
    // Use array form of execSync to prevent shell injection — no string interpolation
    const cmd = ['ssh', '-i', sshKeyPath, '-o', 'StrictHostKeyChecking=no', '-o', 'BatchMode=yes', `${sshUser}@localhost`, 'sudo', 'reboot'];

    execSync(cmd, {
      timeout: 10000,
      encoding: "utf8",
      stdio: 'pipe',
    });

    logger.info("Server restart command executed");
    return res.status(200).json({ success: true, message: "Server rebooting" });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({
      error: e?.message ?? "Failed to restart server",
    });
  }
}