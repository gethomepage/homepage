import logger from "utils/logger";
import genericProxyHandler from "utils/proxies/generic";
import credentialedProxyHandler from "utils/proxies/credentialed";
import rutorrentProxyHandler from "utils/proxies/rutorrent";
import nzbgetProxyHandler from "utils/proxies/nzbget";
import npmProxyHandler from "utils/proxies/npm";
import transmissionProxyHandler from "utils/proxies/transmission";
import qbittorrentProxyHandler from "utils/proxies/qbittorrent";

function asJson(data) {
  if (data?.length > 0) {
    const json = JSON.parse(data.toString());
    return json;
  }
  return data;
}

function jsonArrayTransform(data, transform) {
  const json = asJson(data);
  if (json instanceof Array) {
    return transform(json);
  }
  return json;
}

function jsonArrayFilter(data, filter) {
  return jsonArrayTransform(data, (items) => items.filter(filter));
}

const serviceProxyHandlers = {
  // uses query param auth
  emby: genericProxyHandler,
  jellyfin: genericProxyHandler,
  pihole: genericProxyHandler,
  radarr: {
    proxy: genericProxyHandler,
    maps: {
      movie: (data) => ({
        wanted: jsonArrayFilter(data, (item) => item.isAvailable === false).length,
        have: jsonArrayFilter(data, (item) => item.isAvailable === true).length,
      }),
    },
  },
  sonarr: {
    proxy: genericProxyHandler,
    maps: {
      series: (data) => ({
        total: asJson(data).length,
      }),
    },
  },
  lidarr: {
    proxy: genericProxyHandler,
    maps: {
      album: (data) => ({
        have: jsonArrayFilter(data, (item) => item?.statistics?.percentOfTracks === 100).length,
      }),
    },
  },
  readarr: {
    proxy: genericProxyHandler,
    maps: {
      book: (data) => ({
        have: jsonArrayFilter(data, (item) => item?.statistics?.bookFileCount > 0).length,
      }),
    },
  },
  bazarr: {
    proxy: genericProxyHandler,
    maps: {
      movies: (data) => ({
        total: asJson(data).total,
      }),
      episodes: (data) => ({
        total: asJson(data).total,
      }),
    },
  },
  speedtest: genericProxyHandler,
  tautulli: genericProxyHandler,
  traefik: genericProxyHandler,
  sabnzbd: genericProxyHandler,
  jackett: genericProxyHandler,
  adguard: genericProxyHandler,
  strelaysrv: genericProxyHandler,
  mastodon: genericProxyHandler,
  // uses X-API-Key (or similar) header auth
  gotify: credentialedProxyHandler,
  portainer: credentialedProxyHandler,
  jellyseerr: credentialedProxyHandler,
  overseerr: credentialedProxyHandler,
  ombi: credentialedProxyHandler,
  coinmarketcap: credentialedProxyHandler,
  prowlarr: credentialedProxyHandler,
  authentik: credentialedProxyHandler,
  // super specific handlers
  rutorrent: rutorrentProxyHandler,
  nzbget: nzbgetProxyHandler,
  npm: npmProxyHandler,
  transmission: transmissionProxyHandler,
  qbittorrent: qbittorrentProxyHandler,
};

export default async function handler(req, res) {
  try {
    const { type } = req.query;

    const serviceProxyHandler = serviceProxyHandlers[type];

    if (serviceProxyHandler) {
      if (serviceProxyHandler instanceof Function) {
        return serviceProxyHandler(req, res);
      }
  
      const { proxy, maps } = serviceProxyHandler;
      if (proxy) {
        return proxy(req, res, maps);
      }
    }

    logger.debug("Unknown proxy service type: %s", type);
    return res.status(403).json({ error: "Unkown proxy service type" });
  }
  catch (ex) {
    logger.error(ex);
    return res.status(500).send({ error: "Unexpected error" });
  }
}
