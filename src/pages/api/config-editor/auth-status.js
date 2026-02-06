/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const enabled = !!process.env.HOMEPAGE_CONFIGURATOR_PASSWORD;
  const username = enabled ? process.env.HOMEPAGE_CONFIGURATOR_USERNAME || "admin" : null;

  return res.status(200).json({ enabled, username });
}
