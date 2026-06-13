import { getServerSession } from "next-auth/next";

import { authOptions } from "pages/api/auth/[...nextauth]";
import { handleMcpRequest, mcpAuthorized, mcpEnabled } from "utils/mcp/homepage-mcp";

async function hasHomepageSession(req, res) {
  if (!process.env.HOMEPAGE_AUTH_ENABLED) return false;
  return Boolean(await getServerSession(req, res, authOptions));
}

export default async function handler(req, res) {
  if (!mcpEnabled()) {
    return res.status(404).end("Not Found");
  }

  if (!mcpAuthorized(req) && !(await hasHomepageSession(req, res))) {
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
