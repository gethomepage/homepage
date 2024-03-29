import adguard from "./adguard/widget";
import atsumeru from "./atsumeru/widget";
import audiobookshelf from "./audiobookshelf/widget";
import authentik from "./authentik/widget";
import autobrr from "./autobrr/widget";
import azuredevops from "./azuredevops/widget";
import bazarr from "./bazarr/widget";
import caddy from "./caddy/widget";
import calendar from "./calendar/widget";
import calibreweb from "./calibreweb/widget";
import changedetectionio from "./changedetectionio/widget";
import channelsdvrserver from "./channelsdvrserver/widget";
import cloudflared from "./cloudflared/widget";
import coinmarketcap from "./coinmarketcap/widget";
import crowdsec from "./crowdsec/widget";
import customapi from "./customapi/widget";
import deluge from "./deluge/widget";
import diskstation from "./diskstation/widget";
import downloadstation from "./downloadstation/widget";
import emby from "./emby/widget";
import esphome from "./esphome/widget";
import evcc from "./evcc/widget";
import fileflows from "./fileflows/widget";
import flood from "./flood/widget";
import freshrss from "./freshrss/widget";
import fritzbox from "./fritzbox/widget";
import gamedig from "./gamedig/widget";
import gatus from "./gatus/widget";
import ghostfolio from "./ghostfolio/widget";
import gitea from "./gitea/widget";
import glances from "./glances/widget";
import gluetun from "./gluetun/widget";
import gotify from "./gotify/widget";
import grafana from "./grafana/widget";
import hdhomerun from "./hdhomerun/widget";
import homeassistant from "./homeassistant/widget";
import homebox from "./homebox/widget";
import homebridge from "./homebridge/widget";
import healthchecks from "./healthchecks/widget";
import immich from "./immich/widget";
import jackett from "./jackett/widget";
import jellyseerr from "./jellyseerr/widget";
import jdownloader from "./jdownloader/widget";
import kavita from "./kavita/widget";
import komga from "./komga/widget";
import kopia from "./kopia/widget";
import lidarr from "./lidarr/widget";
import mastodon from "./mastodon/widget";
import mealie from "./mealie/widget";
import medusa from "./medusa/widget";
import minecraft from "./minecraft/widget";
import miniflux from "./miniflux/widget";
import mikrotik from "./mikrotik/widget";
import mjpeg from "./mjpeg/widget";
import moonraker from "./moonraker/widget";
import mylar from "./mylar/widget";
import navidrome from "./navidrome/widget";
import netdata from "./netdata/widget";
import nextcloud from "./nextcloud/widget";
import nextdns from "./nextdns/widget";
import npm from "./npm/widget";
import nzbget from "./nzbget/widget";
import octoprint from "./octoprint/widget";
import omada from "./omada/widget";
import ombi from "./ombi/widget";
import opendtu from "./opendtu/widget";
import opnsense from "./opnsense/widget";
import overseerr from "./overseerr/widget";
import openmediavault from "./openmediavault/widget";
import openwrt from "./openwrt/widget";
import paperlessngx from "./paperlessngx/widget";
import peanut from "./peanut/widget";
import pfsense from "./pfsense/widget";
import photoprism from "./photoprism/widget";
import proxmoxbackupserver from "./proxmoxbackupserver/widget";
import pialert from "./pialert/widget";
import pihole from "./pihole/widget";
import plantit from "./plantit/widget";
import plex from "./plex/widget";
import portainer from "./portainer/widget";
import prometheus from "./prometheus/widget";
import prowlarr from "./prowlarr/widget";
import proxmox from "./proxmox/widget";
import pterodactyl from "./pterodactyl/widget";
import pyload from "./pyload/widget";
import qbittorrent from "./qbittorrent/widget";
import qnap from "./qnap/widget";
import radarr from "./radarr/widget";
import readarr from "./readarr/widget";
import rutorrent from "./rutorrent/widget";
import sabnzbd from "./sabnzbd/widget";
import scrutiny from "./scrutiny/widget";
import sonarr from "./sonarr/widget";
import speedtest from "./speedtest/widget";
import stash from "./stash/widget";
import strelaysrv from "./strelaysrv/widget";
import tailscale from "./tailscale/widget";
import tandoor from "./tandoor/widget";
import tautulli from "./tautulli/widget";
import tdarr from "./tdarr/widget";
import traefik from "./traefik/widget";
import transmission from "./transmission/widget";
import tubearchivist from "./tubearchivist/widget";
import truenas from "./truenas/widget";
import unifi from "./unifi/widget";
import unmanic from "./unmanic/widget";
import uptimekuma from "./uptimekuma/widget";
import uptimerobot from "./uptimerobot/widget";
import watchtower from "./watchtower/widget";
import whatsupdocker from "./whatsupdocker/widget";
import xteve from "./xteve/widget";
import urbackup from "./urbackup/widget";
import romm from "./romm/widget";

const widgets = {
  adguard,
  atsumeru,
  audiobookshelf,
  authentik,
  autobrr,
  azuredevops,
  bazarr,
  caddy,
  calibreweb,
  changedetectionio,
  channelsdvrserver,
  cloudflared,
  coinmarketcap,
  crowdsec,
  customapi,
  deluge,
  diskstation,
  downloadstation,
  emby,
  esphome,
  evcc,
  fileflows,
  flood,
  freshrss,
  fritzbox,
  gamedig,
  gatus,
  ghostfolio,
  gitea,
  glances,
  gluetun,
  gotify,
  grafana,
  hdhomerun,
  homeassistant,
  homebox,
  homebridge,
  healthchecks,
  ical: calendar,
  immich,
  jackett,
  jdownloader,
  jellyfin: emby,
  jellyseerr,
  kavita,
  komga,
  kopia,
  lidarr,
  mastodon,
  mealie,
  medusa,
  minecraft,
  miniflux,
  mikrotik,
  mjpeg,
  moonraker,
  mylar,
  navidrome,
  netdata,
  nextcloud,
  nextdns,
  npm,
  nzbget,
  octoprint,
  omada,
  ombi,
  opendtu,
  opnsense,
  overseerr,
  openmediavault,
  openwrt,
  paperlessngx,
  peanut,
  pfsense,
  photoprism,
  proxmoxbackupserver,
  pialert,
  pihole,
  plantit,
  plex,
  portainer,
  prometheus,
  prowlarr,
  proxmox,
  pterodactyl,
  pyload,
  qbittorrent,
  qnap,
  radarr,
  readarr,
  romm,
  rutorrent,
  sabnzbd,
  scrutiny,
  sonarr,
  speedtest,
  stash,
  strelaysrv,
  tailscale,
  tandoor,
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
  uptimerobot,
  urbackup,
  watchtower,
  whatsupdocker,
  xteve,
};

export default widgets;
