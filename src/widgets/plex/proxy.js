/* eslint-disable no-underscore-dangle */
import cache from "memory-cache";
import { xml2json } from "xml-js";

import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";

const proxyName = "plexProxyHandler";
const librariesCacheKey = `${proxyName}__libraries`;
const albumsCacheKey = `${proxyName}__albums`;
const moviesCacheKey = `${proxyName}__movies`;
const tvCacheKey = `${proxyName}__tv`;
const logger = createLogger(proxyName);

async function getWidget(req) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return null;
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return null;
  }

  return widget;
}

async function fetchFromPlexAPI(endpoint, widget) {
  const api = widgets?.[widget.type]?.api;
  if (!api) {
    return [403, null];
  }

  const url = new URL(formatApiCall(api, { endpoint, ...widget }));

  const [status, contentType, data] = await httpProxy(url);

  if (status !== 200) {
    logger.error("HTTP %d communicating with Plex. Data: %s", status, data.toString());
    return [status, data];
  }

  try {
    const dataDecoded = xml2json(data.toString(), { compact: true });
    return [status, JSON.parse(dataDecoded), contentType];
  } catch (e) {
    logger.error("Error decoding Plex API data. Data: %s", data.toString());
    return [status, null];
  }
}

export default async function plexProxyHandler(req, res) {
  const widget = await getWidget(req);

  const { service } = req.query;

  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  logger.debug("Getting streams from Plex API");
  let streams;
  let [status, apiData] = await fetchFromPlexAPI("/status/sessions", widget);

  if (status !== 200) {
    return res
      .status(status)
      .json({ error: { message: "HTTP error communicating with Plex API", data: Buffer.from(apiData).toString() } });
  }

  if (apiData && apiData.MediaContainer) {
    streams = apiData.MediaContainer._attributes.size;
  }

  let libraries = cache.get(`${librariesCacheKey}.${service}`);
  if (libraries === null) {
    logger.debug("Getting libraries from Plex API");
    [status, apiData] = await fetchFromPlexAPI("/library/sections", widget);
    if (apiData && apiData.MediaContainer) {
      libraries = [].concat(apiData.MediaContainer.Directory);
      cache.put(`${librariesCacheKey}.${service}`, libraries, 1000 * 60 * 60 * 6);
    }
  }

  let albums = cache.get(`${albumsCacheKey}.${service}`);
  let movies = cache.get(`${moviesCacheKey}.${service}`);
  let tv = cache.get(`${tvCacheKey}.${service}`);
  if (albums === null || movies === null || tv === null) {
    albums = 0;
    movies = 0;
    tv = 0;
    logger.debug("Getting counts from Plex API");
    const movieTVLibraries = libraries.filter((l) => ["movie", "show", "artist"].includes(l._attributes.type));
    await Promise.all(
      movieTVLibraries.map(async (library) => {
        const libraryURL = ["movie", "show"].includes(library._attributes.type)
          ? `/library/sections/${library._attributes.key}/all` // tv + movies
          : `/library/sections/${library._attributes.key}/albums`; // music
        [status, apiData] = await fetchFromPlexAPI(libraryURL, widget);
        if (apiData && apiData.MediaContainer) {
          const size = parseInt(apiData.MediaContainer._attributes.size, 10);
          if (library._attributes.type === "movie") {
            movies += size;
          } else if (library._attributes.type === "show") {
            tv += size;
          } else if (library._attributes.type === "artist") {
            albums += size;
          }
        }
      }),
    );
    cache.put(`${albumsCacheKey}.${service}`, albums, 1000 * 60 * 10);
    cache.put(`${tvCacheKey}.${service}`, tv, 1000 * 60 * 10);
    cache.put(`${moviesCacheKey}.${service}`, movies, 1000 * 60 * 10);
  }

  const data = {
    streams,
    albums,
    movies,
    tv,
  };

  return res.status(status).send(data);
}
