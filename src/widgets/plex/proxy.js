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
const moviesCacheKey = `${proxyName}__movies`;
const tvCacheKey = `${proxyName}__tv`;
const logger = createLogger(proxyName);

async function getWidget(req) {
  const { group, service } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return null;
  }

  const widget = await getServiceWidget(group, service);

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
  if (!widget) {
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  logger.debug("Getting streams from Plex API");
  let streams;
  let [status, apiData] = await fetchFromPlexAPI("/status/sessions", widget);

  if (status !== 200) {
    return res.status(status).json({error: {message: "HTTP error communicating with Plex API", data: apiData}});
  }

  if (apiData && apiData.MediaContainer) {
    streams = apiData.MediaContainer._attributes.size;
  }

  let libraries = cache.get(librariesCacheKey);
  if (libraries === null) {
    logger.debug("Getting libraries from Plex API");
    [status, apiData] = await fetchFromPlexAPI("/library/sections", widget);
    if (apiData && apiData.MediaContainer) {
      libraries = apiData.MediaContainer.Directory;
      cache.put(librariesCacheKey, libraries, 1000 * 60 * 60 * 6);
    }
  }

  let movies = cache.get(moviesCacheKey);
  let tv = cache.get(tvCacheKey);
  if (movies === null || tv === null) {
    movies = 0;
    tv = 0;
    logger.debug("Getting movie + tv counts from Plex API");
    libraries.filter(l => ["movie", "show"].includes(l._attributes.type)).forEach(async (library) => {
      [status, apiData] = await fetchFromPlexAPI(`/library/sections/${library._attributes.key}/all`, widget);
      if (apiData && apiData.MediaContainer) {
        const size = parseInt(apiData.MediaContainer._attributes.size, 10);
        if (library._attributes.type === "movie") {
          movies += size;
        } else if (library._attributes.type === "show") {
          tv += size;
        }
      }
      cache.put(tvCacheKey, tv, 1000 * 60 * 10);
      cache.put(moviesCacheKey, movies, 1000 * 60 * 10);
    });
  }
  
  const data = {
    streams,
    tv,
    movies
  };

  return res.status(status).send(data);
}
