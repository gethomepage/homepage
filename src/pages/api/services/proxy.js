import genericProxyHandler from "utils/proxies/generic";
import credentialedProxyHandler from "utils/proxies/credentialed";
import rutorrentProxyHandler from "utils/proxies/rutorrent";
import nzbgetProxyHandler from "utils/proxies/nzbget";
import npmProxyHandler from "utils/proxies/npm";
import transmissionProxyHandler from "utils/proxies/transmission";
import qbittorrentProxyHandler from "utils/proxies/qbittorrent";

function jsonArrayMapper(data, map) {
  if (data?.length > 0) {
    const json = JSON.parse(data.toString());
    if (json instanceof Array) {
      return json.map(map);
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
  readarr: genericProxyHandler,
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
  qbittorrent: qbittorrentProxyHandler,
};

export default async function handler(req, res) {
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

  return res.status(403).json({ error: "Unkown proxy service type" });
}
