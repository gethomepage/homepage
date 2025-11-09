import { getSettings } from "utils/config/config";

export default function handler(req, res) {
  const settings = getSettings();

  if (settings.disableIndexing) {
    res.setHeader("Content-Type", "text/plain");
    res.send(`User-agent: *
Disallow: /`);
    return;
  }

  res.setHeader("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /`);
}
