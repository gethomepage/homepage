import { listEditableConfigs, readEditableConfig } from "utils/config/editor";

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const configs = listEditableConfigs().map((config) => {
    try {
      const current = readEditableConfig(config.id);
      return {
        id: current.id,
        filename: current.filename,
        label: current.label,
        type: current.type,
        data: current.data,
      };
    } catch (error) {
      return {
        id: config.id,
        filename: config.filename,
        label: config.label,
        type: config.type,
        error: error.message,
      };
    }
  });

  return res.status(200).json({ configs });
}
