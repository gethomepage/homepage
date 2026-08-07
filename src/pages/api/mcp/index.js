import { getServerSession } from "next-auth/next";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { isAuthEnabled } from "utils/env";
import createLogger from "utils/logger";
import { handleMcpRequest, mcpEnabled, mcpTokenAuthorized, mcpTokenConfigError } from "utils/mcp/homepage-mcp";

async function hasHomepageSession(req, res) {
  if (!isAuthEnabled()) return false;
  return Boolean(await getServerSession(req, res, authOptions));
}

export default async function handler(req, res) {
  if (!mcpEnabled()) {
    return res.status(404).end("Not Found");
  }

  const tokenError = mcpTokenConfigError();
  if (tokenError) {
    createLogger("mcp").error(tokenError);
    return res.status(500).json({ error: "MCP token is misconfigured. See logs for details." });
  }

  if (!mcpTokenAuthorized(req) && !(await hasHomepageSession(req, res))) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const response = handleMcpRequest(req.body);
  if (!response) {
    return res.status(202).end();
  }

  return res.status(200).json(response);
}
