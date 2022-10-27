import adguard from "./adguard/widget";
import authentik from "./authentik/widget";
import autobrr from "./autobrr/widget";
import bazarr from "./bazarr/widget";
import changedetectionio from "./changedetectionio/widget";
import coinmarketcap from "./coinmarketcap/widget";
import emby from "./emby/widget";
import gotify from "./gotify/widget";
import homebridge from "./homebridge/widget";
import jackett from "./jackett/widget";
import jellyseerr from "./jellyseerr/widget";
import lidarr from "./lidarr/widget";
import mastodon from "./mastodon/widget";
import npm from "./npm/widget";
import nzbget from "./nzbget/widget";
import ombi from "./ombi/widget";
import overseerr from "./overseerr/widget";
import pihole from "./pihole/widget";
import plex from "./plex/widget";
import portainer from "./portainer/widget";
import prowlarr from "./prowlarr/widget";
import proxmox from "./proxmox/widget";
import qbittorrent from "./qbittorrent/widget";
import radarr from "./radarr/widget";
import readarr from "./readarr/widget";
import rutorrent from "./rutorrent/widget";
import sabnzbd from "./sabnzbd/widget";
import scripted from './scripted/widget';
import sonarr from "./sonarr/widget";
import speedtest from "./speedtest/widget";
import strelaysrv from "./strelaysrv/widget";
import tautulli from "./tautulli/widget";
import traefik from "./traefik/widget";
import transmission from "./transmission/widget";
import unifi from "./unifi/widget";

const widgets = {
  adguard,
  authentik,
  autobrr,
  bazarr,
  changedetectionio,
  coinmarketcap,
  emby,
  gotify,
  homebridge,
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
  plex,
  portainer,
  prowlarr,
  proxmox,
  qbittorrent,
  radarr,
  readarr,
  rutorrent,
  sabnzbd,
  scripted,
  sonarr,
  speedtest,
  strelaysrv,
  tautulli,
  traefik,
  transmission,
  unifi,
  unifi_console: unifi,
};

export default widgets;
