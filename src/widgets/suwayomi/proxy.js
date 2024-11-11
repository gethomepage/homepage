import { httpProxy } from "utils/proxy/http";
import { formatApiCall } from "utils/proxy/api-helpers";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "suwayomiProxyHandler";
const logger = createLogger(proxyName);

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
 * @typedef {object} countsToExtractItem
 * @property {(c: chapter) => boolean} condition
 * @property {string} gqlCondition
 */

/**
 * Makes a GraphQL query body based on the provided fieldsSet and category.
 *
 * @param {Set} fieldsSet - Set of fields to include in the query.
 * @param {string|number|undefined} [category="all"] - Category ID or "all" for general counts.
 * @param {Record<string, countsToExtractItem>} countsToExtract - Object containing counts to extract.
 * @returns {string} - The JSON stringified query body.
 */
function makeBody(fieldsSet, countsToExtract, category = "all") {
  if (Number.isNaN(Number(category))) {
    let query = "";
    fieldsSet.forEach((f) => {
      query += `
      ${f}: chapters(
        condition: {${countsToExtract[f].gqlCondition}}
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
 *
 * @param {ResponseJSON|ResponseJSONcategory} responseJSON
 * @param {string[]} fields
 * @param {Record<string, countsToExtractItem>} countsToExtract
 * @returns
 */
function extractCounts(responseJSON, fields, countsToExtract) {
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

export default async function suwayomiProxyHandler(req, res) {
  const { group, service, endpoint } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }
  /** @type {{ fields: string[],category: string|number|undefined, type: keyof typeof widgets }} */
  const widget = await getServiceWidget(group, service);

  if (widget.fields.length === 0) {
    widget.fields = ["download", "nondownload", "read", "unread"];
  }

  widget.fields.length = 4;
  widget.fields = widget.fields.map((f) => f.toLowerCase());
  /** @type {Set<string>} */
  const fieldsSet = new Set(widget.fields);

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

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  const body = makeBody(fieldsSet, countsToExtract, widget.category);

  const headers = {
    "Content-Type": "application/json",
  };

  if (widget.username && widget.password) {
    headers.Authorization = `Basic ${Buffer.from(`${widget.username}:${widget.password}`).toString("base64")}`;
  }

  const [status, contentType, data] = await httpProxy(url, {
    method: "POST",
    body,
    headers,
  });

  if (status === 401) {
    logger.error("Invalid or missing username or password for service '%s' in group '%s'", service, group);
    return res.status(401).send({ error: { message: "401: unauthorized, username or password is incorrect." } });
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

  const returnData = extractCounts(responseJSON, widget.fields, countsToExtract);

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(returnData);
}
