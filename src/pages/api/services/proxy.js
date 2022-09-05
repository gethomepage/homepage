import genericProxyHandler from "utils/proxies/generic";
import credentialedProxyHandler from "utils/proxies/credentialed";
import rutorrentProxyHandler from "utils/proxies/rutorrent";
import nzbgetProxyHandler from "utils/proxies/nzbget";
import npmProxyHandler from "utils/proxies/npm";

const serviceProxyHandlers = {
  // uses query param auth
  emby: genericProxyHandler,
  jellyfin: genericProxyHandler,
  pihole: genericProxyHandler,
  radarr: genericProxyHandler,
  sonarr: genericProxyHandler,
  speedtest: genericProxyHandler,
  tautulli: genericProxyHandler,
  traefik: genericProxyHandler,
  // uses X-API-Key header auth
  portainer: credentialedProxyHandler,
  jellyseerr: credentialedProxyHandler,
  ombi: credentialedProxyHandler,
  // super specific handlers
  rutorrent: rutorrentProxyHandler,
  nzbget: nzbgetProxyHandler,
  npm: npmProxyHandler,
};

export default async function handler(req, res) {
  const { type } = req.query;

  const serviceProxyHandler = serviceProxyHandlers[type];

  if (serviceProxyHandler) {
    return serviceProxyHandler(req, res);
  }

  res.status(403).json({ error: "Unkown proxy service type" });
}
