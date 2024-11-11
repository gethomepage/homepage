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
 * @typedef ResponseJSONcategory
 * @type {{
 *   data: {
 *     category: {
 *       mangas: {
 *         nodes: {
 *           chapters: {
 *             nodes: {
 *               isRead: boolean,
 *               isDownloaded: boolean
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }}
 */

/**
 * Makes a GraphQL query body based on the provided fieldsSet and category.
 *
 * @param {Set} fieldsSet - Set of fields to include in the query.
 * @param {string|number|undefined} [category="all"] - Category ID or "all" for general counts.
 * @returns {string} - The JSON stringified query body.
 */
function makeBody(fieldsSet, category = "all") {
  if (Number.isNaN(Number(category))) {
    return JSON.stringify({
      operationName: "Counts",
      query: `
      query Counts {
        ${
          fieldsSet.has("download")
            ? `
        download: chapters(
          condition: {isDownloaded: true}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }`
            : ""
        }
        ${
          fieldsSet.has("nondownload")
            ? `
        nondownload: chapters(
          condition: {isDownloaded: true}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }
        `
            : ""
        }
        ${
          fieldsSet.has("read")
            ? `
        read: chapters(
          condition: {isRead: true}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }
        `
            : ""
        }
        ${
          fieldsSet.has("unread")
            ? `
        unread: chapters(
          condition: {isRead: false}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }
        `
            : ""
        }
        ${
          fieldsSet.has("downloadedread")
            ? `
        downloadedread: chapters(
          condition: {isDownloaded: true, isRead: true}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }
        `
            : ""
        }
        ${
          fieldsSet.has("downloadedunread")
            ? `
        downloadedunread: chapters(
          condition: {isDownloaded: true, isRead: false}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }
        `
            : ""
        }
        ${
          fieldsSet.has("nondownloadedread")
            ? `
        nondownloadedread: chapters(
          condition: {isDownloaded: false, isRead: true}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }
        `
            : ""
        }
        ${
          fieldsSet.has("nondownloadedunread")
            ? `
        nondownloadedunread: chapters(
          condition: {isDownloaded: false, isRead: false}
          filter: {inLibrary: {equalTo: true}}
        ) {
          totalCount
        }
        `
            : ""
        }
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
 * Makes a Basic Authentication token encoded in base64.
 *
 * @param {string|undefined} username - The username for authentication.
 * @param {string|undefined} password - The password for authentication.
 * @returns {string|null} A Basic Authentication token, or null if username or password is missing.
 */
function makeAuth(username, password) {
  if (username && password) {
    // Combine username and password, and encode them in base64
    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }
  // Return null if either username or password is not provided
  return null;
}

/**
 * Extracts count data from the response JSON and appends it to the returnData array.
 *
 * @param {ResponseJSON|ResponseJSONcategory} responseJSON - The JSON response containing the data.
 * @param {keyof ResponseJSON["data"]} fieldName - The name of the field to extract.
 * @param {Function} condition - A function to compare and determine the count condition.
 * @returns {{ count: number, label: string }} - An object containing the count and label.
 */
function extractCounts(responseJSON, fieldName, condition) {
  if (fieldName in responseJSON.data) {
    return {
      count: responseJSON.data[fieldName].totalCount,
      label: `suwayomi.${fieldName}`,
    };
  }
  return {
    count: responseJSON.data.category.mangas.nodes.reduce(
      (aa, cc) =>
        cc.chapters.nodes.reduce((a, c) => {
          if (condition(c)) {
            return a + 1;
          }
          return a;
        }, 0) + aa,
      0,
    ),
    label: `suwayomi.${fieldName}`,
  };
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

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));

  const body = makeBody(fieldsSet, widget.category);

  const [status, contentType, data] = await httpProxy(url, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      Authorization: makeAuth(widget.username, widget.password),
    },
  });

  if (status === 401) {
    logger.error("unauthorized username or password for Suwayomi is incorrect.");
    return res
      .status(401)
      .send({ error: { message: "401: unauthorized username or password for Suwayomi is incorrect." } });
  }

  if (status !== 200) {
    logger.error("Error getting data from Suwayomi: %d.  Data: %s", status, data);
    return res.status(status).send({ error: { message: "Error getting data from Suwayomi", body, data } });
  }

  /** @type {ResponseJSON|ResponseJSONcategory} */
  const responseJSON = JSON.parse(data);

  const countsToExtract = {
    download: (c) => c.isDownloaded,
    nondownload: (c) => !c.isDownloaded,
    read: (c) => c.isRead,
    unread: (c) => !c.isRead,
    downloadedread: (c) => c.isDownloaded && c.isRead,
    downloadedunread: (c) => c.isDownloaded && !c.isRead,
    nondownloadedread: (c) => !c.isDownloaded && c.isRead,
    nondownloadedunread: (c) => !c.isDownloaded && !c.isRead,
  };

  const returnData = widget.fields.map((name) => extractCounts(responseJSON, name, countsToExtract[name]));
  // this would be used for setting the service.description if it was possible
  // if ("category" in responseJSON.data){
  //   returnData.name = responseJSON.data.category.name
  // }

  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(status).send(returnData);
}
