import { checkAllowedGroup, readAuthSettings } from "utils/auth/auth-helpers";
import { getSettings } from "utils/config/config";

export default async function handler(req, res) {
    const { group } = req.query;
    const { provider, groups } = readAuthSettings(getSettings().auth)

    try {
        if (checkAllowedGroup(provider.permissions(req), groups, group)) {
            res.json({group})
        } else {
            res.status(401).json({message:"Group unathorized"})
        }
    } catch (err) {
        res.status(500).send("Error authenticating");
    }
}
