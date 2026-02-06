import { readEditableConfig, writeEditableConfig } from "utils/config/editor";

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default function handler(req, res) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid config id" });
  }

  try {
    if (req.method === "GET") {
      const config = readEditableConfig(id);
      return res.status(200).json({
        id: config.id,
        filename: config.filename,
        label: config.label,
        type: config.type,
        data: config.data,
      });
    }

    if (req.method === "PUT") {
      const { data } = req.body ?? {};
      if (data === undefined) {
        return res.status(400).json({ error: "Missing data payload" });
      }

      const updated = writeEditableConfig(id, data);

      return res.status(200).json({
        id: updated.id,
        filename: updated.filename,
        label: updated.label,
        type: updated.type,
        data: updated.data,
        backupFile: updated.backupFile,
      });
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    if (error.message === "Unsupported config") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(422).json({ error: error.message });
  }
}
