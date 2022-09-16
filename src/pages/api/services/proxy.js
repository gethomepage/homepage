import genericProxyHandler from "utils/proxies/generic";
import credentialedProxyHandler from "utils/proxies/credentialed";
import rutorrentProxyHandler from "utils/proxies/rutorrent";
import nzbgetProxyHandler from "utils/proxies/nzbget";
import npmProxyHandler from "utils/proxies/npm";
import transmissionProxyHandler from "utils/proxies/transmission";

function simpleArrayMapper(endpoint, targetEndpoint, data, mapper) {
  if ((data?.length > 0) && (endpoint === targetEndpoint)) {
    const json = JSON.parse(data.toString());
    if (json instanceof Array) {
      return json.map(mapper);
    }
  }
  return data;
}

const serviceProxyHandlers = {
  // uses query param auth
  emby: genericProxyHandler,
  jellyfin: genericProxyHandler,
  pihole: genericProxyHandler,
  radarr: genericProxyHandler,
  sonarr: genericProxyHandler,
  lidarr: genericProxyHandler,
  readarr: { proxy: genericProxyHandler, mapper: (endpoint, data) =>
    simpleArrayMapper(endpoint, "book", data, d => ({ statistics: { bookFileCount: d.statistics.bookFileCount } }))
  },
  bazarr: genericProxyHandler,
  speedtest: genericProxyHandler,
  tautulli: genericProxyHandler,
  traefik: genericProxyHandler,
  sabnzbd: genericProxyHandler,
  jackett: genericProxyHandler,
  adguard: genericProxyHandler,
  // uses X-API-Key (or similar) header auth
  gotify: credentialedProxyHandler,
  portainer: credentialedProxyHandler,
  jellyseerr: credentialedProxyHandler,
  overseerr: credentialedProxyHandler,
  ombi: credentialedProxyHandler,
  coinmarketcap: credentialedProxyHandler,
  prowlarr: credentialedProxyHandler,
  // super specific handlers
  rutorrent: rutorrentProxyHandler,
  nzbget: nzbgetProxyHandler,
  npm: npmProxyHandler,
  transmission: transmissionProxyHandler,
};

export default async function handler(req, res) {
  const { type } = req.query;

  const serviceProxyHandler = serviceProxyHandlers[type];

  if (serviceProxyHandler) {
    if (serviceProxyHandler instanceof Function) {
      return serviceProxyHandler(req, res);
    }

    const { proxy, mapper } = serviceProxyHandler;
    if (proxy) {
      return proxy(req, res, mapper);
    }
  }

  return res.status(403).json({ error: "Unkown proxy service type" });
}
