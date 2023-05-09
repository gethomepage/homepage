import adguard from "./adguard/widget";
import audiobookshelf from "./audiobookshelf/widget";
import authentik from "./authentik/widget";
import autobrr from "./autobrr/widget";
import bazarr from "./bazarr/widget";
import changedetectionio from "./changedetectionio/widget";
import channelsdvrserver from "./channelsdvrserver/widget";
import cloudflared from "./cloudflared/widget";
import coinmarketcap from "./coinmarketcap/widget";
import deluge from "./deluge/widget";
import diskstation from "./diskstation/widget";
import downloadstation from "./downloadstation/widget";
import emby from "./emby/widget";
import fileflows from "./fileflows/widget";
import flood from "./flood/widget";
import freshrss from "./freshrss/widget";
import ghostfolio from "./ghostfolio/widget";
import gitea from "./gitea/widget";
import gluetun from "./gluetun/widget";
import gotify from "./gotify/widget";
import grafana from "./grafana/widget";
import hdhomerun from "./hdhomerun/widget";
import homeassistant from "./homeassistant/widget";
import homebridge from "./homebridge/widget";
import healthchecks from "./healthchecks/widget";
import immich from "./immich/widget";
import jackett from "./jackett/widget";
import jellyseerr from "./jellyseerr/widget";
import komga from "./komga/widget";
import kopia from "./kopia/widget";
import lidarr from "./lidarr/widget";
import mastodon from "./mastodon/widget";
import medusa from "./medusa/widget";
import minecraft from "./minecraft/widget";
import miniflux from "./miniflux/widget";
import mikrotik from "./mikrotik/widget";
import moonraker from "./moonraker/widget";
import mylar from "./mylar/widget";
import navidrome from "./navidrome/widget";
import nextcloud from "./nextcloud/widget";
import nextdns from "./nextdns/widget";
import npm from "./npm/widget";
import nzbget from "./nzbget/widget";
import octoprint from "./octoprint/widget";
import omada from "./omada/widget";
import ombi from "./ombi/widget";
import opnsense from "./opnsense/widget";
import overseerr from "./overseerr/widget";
import paperlessngx from "./paperlessngx/widget";
import photoprism from "./photoprism/widget";
import proxmoxbackupserver from "./proxmoxbackupserver/widget";
import pihole from "./pihole/widget";
import plex from "./plex/widget";
import portainer from "./portainer/widget";
import prometheus from "./prometheus/widget";
import prowlarr from "./prowlarr/widget";
import proxmox from "./proxmox/widget";
import pterodactyl from "./pterodactyl/widget";
import pyload from "./pyload/widget";
import qbittorrent from "./qbittorrent/widget";
import radarr from "./radarr/widget";
import readarr from "./readarr/widget";
import rutorrent from "./rutorrent/widget";
import sabnzbd from "./sabnzbd/widget";
import scrutiny from "./scrutiny/widget";
import sonarr from "./sonarr/widget";
import speedtest from "./speedtest/widget";
import strelaysrv from "./strelaysrv/widget";
import tailscale from "./tailscale/widget";
import tautulli from "./tautulli/widget";
import tdarr from "./tdarr/widget";
import traefik from "./traefik/widget";
import transmission from "./transmission/widget";
import tubearchivist from "./tubearchivist/widget";
import truenas from "./truenas/widget";
import unifi from "./unifi/widget";
import unmanic from "./unmanic/widget";
import uptimekuma from "./uptimekuma/widget";
import watchtower from "./watchtower/widget";
import whatsupdocker from "./whatsupdocker/widget";
import xteve from "./xteve/widget";

const widgets = {
  adguard,
  audiobookshelf,
  authentik,
  autobrr,
  bazarr,
  changedetectionio,
  channelsdvrserver,
  cloudflared,
  coinmarketcap,
  deluge,
  diskstation,
  downloadstation,
  emby,
  fileflows,
  flood,
  freshrss,
  ghostfolio,
  gitea,
  gluetun,
  gotify,
  grafana,
  hdhomerun,
  homeassistant,
  homebridge,
  healthchecks,
  immich,
  jackett,
  jellyfin: emby,
  jellyseerr,
  komga,
  kopia,
  lidarr,
  mastodon,
  medusa,
  minecraft,
  miniflux,
  mikrotik,
  moonraker,
  mylar,
  navidrome,
  nextcloud,
  nextdns,
  npm,
  nzbget,
  octoprint,
  omada,
  ombi,
  opnsense,
  overseerr,
  paperlessngx,
  photoprism,
  proxmoxbackupserver,
  pihole,
  plex,
  portainer,
  prometheus,
  prowlarr,
  proxmox,
  pterodactyl,
  pyload,
  qbittorrent,
  radarr,
  readarr,
  rutorrent,
  sabnzbd,
  scrutiny,
  sonarr,
  speedtest,
  strelaysrv,
  tailscale,
  tautulli,
  tdarr,
  traefik,
  transmission,
  tubearchivist,
  truenas,
  unifi,
  unifi_console: unifi,
  unmanic,
  uptimekuma,
  watchtower,
  whatsupdocker,
  xteve,
};

export default widgets;
