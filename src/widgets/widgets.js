import adguard from "./adguard/widget";
import apcups from "./apcups/widget";
import argocd from "./argocd/widget";
import atsumeru from "./atsumeru/widget";
import audiobookshelf from "./audiobookshelf/widget";
import authentik from "./authentik/widget";
import autobrr from "./autobrr/widget";
import azuredevops from "./azuredevops/widget";
import backrest from "./backrest/widget";
import bazarr from "./bazarr/widget";
import beszel from "./beszel/widget";
import caddy from "./caddy/widget";
import calendar from "./calendar/widget";
import calibreweb from "./calibreweb/widget";
import changedetectionio from "./changedetectionio/widget";
import channelsdvrserver from "./channelsdvrserver/widget";
import checkmk from "./checkmk/widget";
import cloudflared from "./cloudflared/widget";
import coinmarketcap from "./coinmarketcap/widget";
import crowdsec from "./crowdsec/widget";
import customapi from "./customapi/widget";
import deluge from "./deluge/widget";
import develancacheui from "./develancacheui/widget";
import diskstation from "./diskstation/widget";
import downloadstation from "./downloadstation/widget";
import emby from "./emby/widget";
import esphome from "./esphome/widget";
import evcc from "./evcc/widget";
import filebrowser from "./filebrowser/widget";
import fileflows from "./fileflows/widget";
import firefly from "./firefly/widget";
import flood from "./flood/widget";
import freshrss from "./freshrss/widget";
import frigate from "./frigate/widget";
import fritzbox from "./fritzbox/widget";
import gamedig from "./gamedig/widget";
import gatus from "./gatus/widget";
import ghostfolio from "./ghostfolio/widget";
import gitea from "./gitea/widget";
import gitlab from "./gitlab/widget";
import glances from "./glances/widget";
import gluetun from "./gluetun/widget";
import gotify from "./gotify/widget";
import grafana from "./grafana/widget";
import hdhomerun from "./hdhomerun/widget";
import headscale from "./headscale/widget";
import healthchecks from "./healthchecks/widget";
import homeassistant from "./homeassistant/widget";
import homebox from "./homebox/widget";
import homebridge from "./homebridge/widget";
import immich from "./immich/widget";
import jackett from "./jackett/widget";
import jdownloader from "./jdownloader/widget";
import jellyseerr from "./jellyseerr/widget";
import jellystat from "./jellystat/widget";
import karakeep from "./karakeep/widget";
import kavita from "./kavita/widget";
import komga from "./komga/widget";
import komodo from "./komodo/widget";
import kopia from "./kopia/widget";
import lidarr from "./lidarr/widget";
import linkwarden from "./linkwarden/widget";
import lubelogger from "./lubelogger/widget";
import mailcow from "./mailcow/widget";
import mastodon from "./mastodon/widget";
import mealie from "./mealie/widget";
import medusa from "./medusa/widget";
import mikrotik from "./mikrotik/widget";
import minecraft from "./minecraft/widget";
import miniflux from "./miniflux/widget";
import mjpeg from "./mjpeg/widget";
import moonraker from "./moonraker/widget";
import mylar from "./mylar/widget";
import myspeed from "./myspeed/widget";
import navidrome from "./navidrome/widget";
import netalertx from "./netalertx/widget";
import netdata from "./netdata/widget";
import nextcloud from "./nextcloud/widget";
import nextdns from "./nextdns/widget";
import npm from "./npm/widget";
import nzbget from "./nzbget/widget";
import octoprint from "./octoprint/widget";
import omada from "./omada/widget";
import ombi from "./ombi/widget";
import opendtu from "./opendtu/widget";
import openmediavault from "./openmediavault/widget";
import openwrt from "./openwrt/widget";
import opnsense from "./opnsense/widget";
import overseerr from "./overseerr/widget";
import paperlessngx from "./paperlessngx/widget";
import peanut from "./peanut/widget";
import pfsense from "./pfsense/widget";
import photoprism from "./photoprism/widget";
import pihole from "./pihole/widget";
import plantit from "./plantit/widget";
import plex from "./plex/widget";
import portainer from "./portainer/widget";
import prometheus from "./prometheus/widget";
import prometheusmetric from "./prometheusmetric/widget";
import prowlarr from "./prowlarr/widget";
import proxmox from "./proxmox/widget";
import proxmoxbackupserver from "./proxmoxbackupserver/widget";
import pterodactyl from "./pterodactyl/widget";
import pyload from "./pyload/widget";
import qbittorrent from "./qbittorrent/widget";
import qnap from "./qnap/widget";
import radarr from "./radarr/widget";
import readarr from "./readarr/widget";
import romm from "./romm/widget";
import rutorrent from "./rutorrent/widget";
import sabnzbd from "./sabnzbd/widget";
import scrutiny from "./scrutiny/widget";
import slskd from "./slskd/widget";
import sonarr from "./sonarr/widget";
import speedtest from "./speedtest/widget";
import spoolman from "./spoolman/widget";
import stash from "./stash/widget";
import stocks from "./stocks/widget";
import strelaysrv from "./strelaysrv/widget";
import suwayomi from "./suwayomi/widget";
import swagdashboard from "./swagdashboard/widget";
import tailscale from "./tailscale/widget";
import tandoor from "./tandoor/widget";
import tautulli from "./tautulli/widget";
import tdarr from "./tdarr/widget";
import technitium from "./technitium/widget";
import traefik from "./traefik/widget";
import transmission from "./transmission/widget";
import trilium from "./trilium/widget";
import truenas from "./truenas/widget";
import tubearchivist from "./tubearchivist/widget";
import unifi from "./unifi/widget";
import unmanic from "./unmanic/widget";
import unraid from "./unraid/widget";
import uptimekuma from "./uptimekuma/widget";
import uptimerobot from "./uptimerobot/widget";
import urbackup from "./urbackup/widget";
import vikunja from "./vikunja/widget";
import wallos from "./wallos/widget";
import watchtower from "./watchtower/widget";
import wgeasy from "./wgeasy/widget";
import whatsupdocker from "./whatsupdocker/widget";
import xteve from "./xteve/widget";
import zabbix from "./zabbix/widget";

const widgets = {
  adguard,
  apcups,
  argocd,
  atsumeru,
  audiobookshelf,
  authentik,
  autobrr,
  azuredevops,
  backrest,
  bazarr,
  beszel,
  caddy,
  calibreweb,
  changedetectionio,
  channelsdvrserver,
  checkmk,
  cloudflared,
  coinmarketcap,
  crowdsec,
  customapi,
  deluge,
  develancacheui,
  diskstation,
  downloadstation,
  emby,
  esphome,
  evcc,
  filebrowser,
  fileflows,
  firefly,
  flood,
  freshrss,
  frigate,
  fritzbox,
  gamedig,
  gatus,
  ghostfolio,
  gitea,
  gitlab,
  glances,
  gluetun,
  gotify,
  grafana,
  hdhomerun,
  headscale,
  hoarder: karakeep,
  karakeep,
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
  jellystat,
  kavita,
  komga,
  komodo,
  kopia,
  lidarr,
  linkwarden,
  lubelogger,
  mailcow,
  mastodon,
  mealie,
  medusa,
  minecraft,
  miniflux,
  mikrotik,
  mjpeg,
  moonraker,
  mylar,
  myspeed,
  navidrome,
  netalertx,
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
  pialert: netalertx,
  pihole,
  plantit,
  plex,
  portainer,
  prometheus,
  prometheusmetric,
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
  slskd,
  sonarr,
  speedtest,
  spoolman,
  stash,
  stocks,
  strelaysrv,
  swagdashboard,
  suwayomi,
  tailscale,
  tandoor,
  tautulli,
  technitium,
  tdarr,
  traefik,
  transmission,
  trilium,
  tubearchivist,
  truenas,
  unifi,
  unifi_console: unifi,
  unmanic,
  unraid,
  uptimekuma,
  uptimerobot,
  urbackup,
  vikunja,
  wallos,
  watchtower,
  wgeasy,
  whatsupdocker,
  xteve,
  zabbix,
};

export default widgets;
