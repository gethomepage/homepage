import { getHomepageCapabilities } from "utils/config/capabilities";

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const capabilities = getHomepageCapabilities();
    return res.status(200).json(capabilities);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load capabilities" });
  }
}
