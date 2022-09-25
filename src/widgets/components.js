import dynamic from "next/dynamic";

const components = {
  adguard: dynamic(() => import("./adguard/component")),
  bazarr: dynamic(() => import("./bazarr/component")),
  coinmarketcap: dynamic(() => import("./coinmarketcap/component")),
  overseerr: dynamic(() => import("./overseerr/component")),
  portainer: dynamic(() => import("./portainer/component")),
  prowlarr: dynamic(() => import("./prowlarr/component")),
  qbittorrent: dynamic(() => import("./qbittorrent/component")),
  radarr: dynamic(() => import("./radarr/component")),
  sonarr: dynamic(() => import("./sonarr/component")),
  readarr: dynamic(() => import("./readarr/component")),
  rutorrent: dynamic(() => import("./rutorrent/component")),
  sabnzbd: dynamic(() => import("./sabnzbd/component")),
  speedtest: dynamic(() => import("./speedtest/component")),
  strelaysrv: dynamic(() => import("./strelaysrv/component")),
  tautulli: dynamic(() => import("./tautulli/component")),
  traefik: dynamic(() => import("./traefik/component")),
  transmission: dynamic(() => import("./transmission/component")),
};

export default components;
