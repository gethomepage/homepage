import { getWidgetOptions } from "utils/config/widget-helpers";
import createLogger from "../../../utils/logger";

const logger = createLogger("forward_auth_user");

export default async function handler(req, res) {
  const widgetOptions = await getWidgetOptions("forward_auth_user");
  const { userHeader, emailHeader, groupsHeader } = widgetOptions;

  if (!userHeader || !emailHeader || !groupsHeader) {
    logger.error("Widget configuration incomplete");
    return res.status(400).json({ error: "Widget configuration incomplete" });
  }

  const groupsDelimiter = widgetOptions?.groupsDelimiter || "|";
  const actions = widgetOptions?.actions;

  const username = req.headers[userHeader.toLowerCase()];
  const email = req.headers[emailHeader.toLowerCase()];
  const groups = req.headers[groupsHeader.toLowerCase()];

  if (!username) {
    logger.error("Header for username missing");
    return res.status(400).json({ error: "Missing Header" });
  }
  if (!email) {
    logger.error("Header for email missing");
    return res.status(400).json({ error: "Missing Header" });
  }
  if (!groups) {
    logger.error("Header for groups missing");
    return res.status(400).json({ error: "Missing Header" });
  }

  return res.send({
    username,
    email,
    groups: groups.split(groupsDelimiter),
    actions,
  });
}
