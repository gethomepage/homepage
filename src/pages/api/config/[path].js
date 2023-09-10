import path from "path";
import fs from "fs";

import mime from "mime";

import { CONF_DIR } from "utils/config/config";
import createLogger from "utils/logger";

const logger = createLogger("configFileService");

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const { path: relativePath } = req.query;

  if(relativePath !== 'custom.js' && relativePath !== 'custom.css')
  {
    res.status(422).end('Incorrect file extension, expected custom.js or custom.css')
  }

  const filePath = path.join(CONF_DIR, relativePath);
  const mimeType = mime.getType(relativePath);

  try {
      // Read the content of the file or return empty content
      const fileContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

      res.setHeader('Content-Type', mimeType);
      res.status(200).send(fileContent);
    } catch (error) {
      logger.error(error);
      res.status(500).end('Internal Server Error');
    }
}
