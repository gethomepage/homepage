import { withAuth } from "utils/auth";
import checkAndCopyConfig, { getSettings } from "utils/config/config";

function handler(req, res) {
  checkAndCopyConfig("settings.yaml");
  const settings = getSettings();

  const color = settings.color || "slate";
  const theme = settings.theme || "dark";

  return res.status(200).json({
    color,
    theme,
  });
}

export default withAuth(handler);
