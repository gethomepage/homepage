import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "suwayomiProxyHandler";
const logger = createLogger(proxyName);

/**
 * @typedef {object} countsToExtractItem
 * @property {(chapter: chapter) => boolean} condition
 * @property {string} gqlCondition
 */

/** @type {Record<string, countsToExtractItem>} */
const countsToExtract = {
  download: {
    condition: (c) => c.isDownloaded,
    gqlCondition: "isDownloaded: true",
  },
  nondownload: {
    condition: (c) => !c.isDownloaded,
    gqlCondition: "isDownloaded: false",
  },
  read: { condition: (c) => c.isRead, gqlCondition: "isRead: true" },
  unread: { condition: (c) => !c.isRead, gqlCondition: "isRead: false" },
  downloadedread: { condition: (c) => c.isDownloaded && c.isRead, gqlCondition: "isDownloaded: true, isRead: true" },
  downloadedunread: {
    condition: (c) => c.isDownloaded && !c.isRead,
    gqlCondition: "isDownloaded: true, isRead: false",
  },
  nondownloadedread: {
    condition: (c) => !c.isDownloaded && c.isRead,
    gqlCondition: "isDownloaded: false, isRead: true",
  },
  nondownloadedunread: {
    condition: (c) => !c.isDownloaded && !c.isRead,
    gqlCondition: "isDownloaded: false, isRead: false",
  },
};

/**
 * @typedef totalCount
 * @type {object}
 * @property {string} totalCount - count
 */

/**
 * @typedef ResponseJSON
 * @type {{
 *   data: {
 *     download: totalCount,
 *     nondownload: totalCount,
 *     read: totalCount,
 *     unread: totalCount,
 *     downloadedRead: totalCount,
 *     downloadedunread: totalCount,
 *     nondownloadedread: totalCount,
 *     nondownloadedunread: totalCount,
 *   }
 * }}
 */

/**
 * @typedef chapter
 * @type {{
 *   isRead: boolean,
 *   isDownloaded: boolean
 * }}
 */

/**
 * @typedef ResponseJSONcategory
 * @type {{
 *   data: {
 *     category: {
 *       mangas: {
 *         nodes: {
 *           chapters: {
 *             nodes: chapter[]
 *           }
 *         }[]
 *       }
 *     }
 *   }
 * }}
 */

/**
 * Makes a GraphQL query body based on the provided fieldsSet and category.
 *
 * @param {string[]} fields - Array of field names.
 * @param {string|number|undefined} [category="all"] - Category ID or "all" for general counts.
 * @returns {string} - The JSON stringified query body.
 */
function makeBody(fields, category = "all") {
  if (Number.isNaN(Number(category))) {
    let query = "";
    fields.forEach((field) => {
      query += `
      ${field}: chapters(
        condition: {${countsToExtract[field].gqlCondition}}
        filter: {inLibrary: {equalTo: true}}
      ) {
        totalCount
      }`;
    });
    return JSON.stringify({
      operationName: "Counts",
      query: `
      query Counts {
        ${query}
      }`,
    });
  }

  return JSON.stringify({
    operationName: "category",
    query: `
    query category($id: Int!) {
      category(id: $id) {
        # name
        mangas {
          nodes {
            chapters {
              nodes {
                isRead
                isDownloaded
              }
            }
          }
        }
      }
    }`,
    variables: {
      id: Number(category),
    },
  });
}

/**
 * Extracts the counts from the response JSON object based on the provided fields.
 *
 * @param {ResponseJSON|ResponseJSONcategory} responseJSON - The response JSON object.
 * @param {string[]} fields - Array of field names.
 * @returns
 */
function extractCounts(responseJSON, fields) {
  if (!("category" in responseJSON.data)) {
    return fields.map((field) => ({
      count: responseJSON.data[field].totalCount,
      label: `suwayomi.${field}`,
    }));
  }
  const tmp = responseJSON.data.category.mangas.nodes.reduce(
    (accumulator, manga) => {
      manga.chapters.nodes.forEach((chapter) => {
        fields.forEach((field, i) => {
          if (countsToExtract[field].condition(chapter)) {
            accumulator[i] += 1;
          }
        });
      });
      return accumulator;
    },
    [0, 0, 0, 0],
  );
  return fields.map((field, i) => ({
    count: tmp[i],
    label: `suwayomi.${field}`,
  }));
}

/**
 * @param {string[]|null} Fields
 * @returns {string[]}
 */
function makeFields(Fields = []) {
  let fields = Fields ?? [];
  if (fields.length === 0) {
    fields = ["download", "nonDownload", "read", "unRead"];
  }
  if (fields.length > 4) {
    fields.length = 4;
  }
  fields = fields.map((f) => f.toLowerCase());

  return fields;
}

/**
 * @typedef {object} widget
 * @property {string} username
 * @property {string} password
 * @property {string[]|null} fields
 * @property {string|number|undefined} category
 * @property {keyof typeof widgets} type
 */

/**
 * @param {widget} widget
 * @returns {{ "Content-Type": string, Authorization?: string }}
 */
function makeHeaders(widget) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (widget.username && widget.password) {
    headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
  }
  return headers;
}

export default async function suwayomiProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  /** @type {widget} */
  const widget = await getServiceWidget(group, service);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const fields = makeFields(widget.fields);

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  const body = makeBody(fields, widget.category);

  const headers = makeHeaders(widget);

  const [status, contentType, data] = await httpProxy(url, {
    method: "POST",
    body,
    headers,
  });

  if (status === 401) {
    logger.error("Invalid or missing username or password for service '%s' in group '%s'", service, group);
    return res.status(status).send({ error: { message: "401: unauthorized, username or password is incorrect." } });
  }

  if (status !== 200) {
    logger.error(
      "Error getting data from Suwayomi for service '%s' in group '%s': %d.  Data: %s",
      service,
      group,
      status,
      data,
    );
    return res.status(status).send({ error: { message: "Error getting data. body: %s, data: %s", body, data } });
  }

  /** @type {ResponseJSON|ResponseJSONcategory} */
  const responseJSON = JSON.parse(data);

  const returnData = extractCounts(responseJSON, fields);

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(returnData);
}
