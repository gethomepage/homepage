import path from "path";
import fs from "fs";

import mime from "mime";

import { CONF_DIR } from "utils/config/config";
import createLogger from "utils/logger";

const logger = createLogger("configFileService");

/**
 * Verifies that the config file paths are in subdirectory
 * @param {string} parent Parent initial folder
 * @param {string} child Supposed child path
 * @returns {boolean} true if in a subdirectory
 */
function isSubDirectory(parent, child) {
    return path.relative(child, parent).startsWith('..');
}

/**
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 */
export default async function handler(req, res) {
  const { path: relativePath } = req.query;

  const filePath = path.join(CONF_DIR, relativePath);

  if(!isSubDirectory(CONF_DIR, filePath))
  {
    logger.error(`Forbidden access to parent file: ${ filePath }`);
    res.status(403).end('Forbidden access to parent file');
  }

  const mimeType = mime.getType(relativePath);

  try {
      // Read the content of the CSS file
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Set the response header to indicate that this is a CSS file
      res.setHeader('Content-Type', mimeType);

      // Send the CSS content as the API response
      res.status(200).send(fileContent);
    } catch (error) {
      logger.error(error);
      res.status(500).end('Internal Server Error');
    }
}
