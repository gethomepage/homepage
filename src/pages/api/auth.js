import { checkAllowedGroup, readIdentitySettings } from "utils/identity/identity-helpers";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
  const { group } = req.query;
  const { provider, groups } = readIdentitySettings(getSettings().identity);

  try {
    if (checkAllowedGroup(provider.getIdentity(req), groups, group)) {
      res.json({ group });
    } else {
      res.status(401).json({ message: "Group unathorized" });
    }
  } catch (err) {
    res.status(500).send("Error getting user identity");
  }
}
