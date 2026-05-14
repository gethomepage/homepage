import createLogger from "utils/logger";

const logger = createLogger("serverRestart");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sshKeyPath, sshUser = "ubuntu" } = req.body;

  if (!sshKeyPath) {
    return res.status(400).json({ error: "SSH key path is required" });
  }

  try {
    const { execSync } = await import("child_process");
    const cmd = `ssh -i "${sshKeyPath}" -o StrictHostKeyChecking=no ${sshUser}@localhost "sudo reboot"`;

    execSync(cmd, {
      timeout: 10000,
      encoding: "utf8",
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