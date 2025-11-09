import { getSettings } from "utils/config/config";

export default function handler(req, res) {
  const settings = getSettings();

  // If disableIndexing is true, disallow all robots
  if (settings.disableIndexing) {
    res.setHeader("Content-Type", "text/plain");
    res.send(`User-agent: *
Disallow: /`);
    return;
  }

  // Otherwise, allow all indexing
  res.setHeader("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /`);
}
