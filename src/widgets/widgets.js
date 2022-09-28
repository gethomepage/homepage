import adguard from "./adguard/widget";
import authentik from "./authentik/widget";
import bazarr from "./bazarr/widget";
import coinmarketcap from "./coinmarketcap/widget";
import emby from "./emby/widget";
import gotify from "./gotify/widget";
import jackett from "./jackett/widget";
import jellyseerr from "./jellyseerr/widget";
import lidarr from "./lidarr/widget";
import mastodon from "./mastodon/widget";
import npm from "./npm/widget";
import nzbget from "./nzbget/widget";
import ombi from "./ombi/widget";
import overseerr from "./overseerr/widget";
import pihole from "./pihole/widget";
import portainer from "./portainer/widget";
import prowlarr from "./prowlarr/widget";
import qbittorrent from "./qbittorrent/widget";
import radarr from "./radarr/widget";
import readarr from "./readarr/widget";
import rutorrent from "./rutorrent/widget";
import sabnzbd from "./sabnzbd/widget";
import sonarr from "./sonarr/widget";
import speedtest from "./speedtest/widget";
import strelaysrv from "./strelaysrv/widget";
import tautulli from "./tautulli/widget";
import traefik from "./traefik/widget";
import transmission from "./transmission/widget";

const widgets = {
  adguard,
  authentik,
  bazarr,
  coinmarketcap,
  emby,
  gotify,
  jackett,
  jellyfin: emby,
  jellyseerr,
  lidarr,
  mastodon,
  npm,
  nzbget,
  ombi,
  overseerr,
  pihole,
  portainer,
  prowlarr,
  qbittorrent,
  radarr,
  readarr,
  rutorrent,
  sabnzbd,
  sonarr,
  speedtest,
  strelaysrv,
  tautulli,
  traefik,
  transmission,
};

export default widgets;
