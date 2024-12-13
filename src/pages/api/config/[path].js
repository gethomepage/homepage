import path from "path";
import fs from "fs";

import { CONF_DIR } from "utils/config/config";
import createLogger from "utils/logger";

const logger = createLogger("configFileService");

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const { path: relativePath } = req.query;

  // only two supported files, for now
  if (!["custom.css", "custom.js"].includes(relativePath)) {
    return res.status(422).end("Unsupported file");
  }

  const filePath = path.join(CONF_DIR, relativePath);

  try {
    // Read the content of the file or return empty content
    const fileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
    // hard-coded since we only support two known files for now
    const mimeType = relativePath === "custom.css" ? "text/css" : "text/javascript";
    res.setHeader("Content-Type", mimeType);
    return res.status(200).send(fileContent);
  } catch (error) {
    if (error) logger.error(error);
    return res.status(500).end("Internal Server Error");
  }
}
