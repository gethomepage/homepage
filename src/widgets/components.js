import dynamic from "next/dynamic";

const components = {
  adguard: dynamic(() => import("./adguard/component")),
  apcups: dynamic(() => import("./apcups/component")),
  argocd: dynamic(() => import("./argocd/component")),
  atsumeru: dynamic(() => import("./atsumeru/component")),
  audiobookshelf: dynamic(() => import("./audiobookshelf/component")),
  authentik: dynamic(() => import("./authentik/component")),
  autobrr: dynamic(() => import("./autobrr/component")),
  azuredevops: dynamic(() => import("./azuredevops/component")),
  bazarr: dynamic(() => import("./bazarr/component")),
  beszel: dynamic(() => import("./beszel/component")),
  bitcoin: dynamic(() => import("./bitcoin/component")),
  caddy: dynamic(() => import("./caddy/component")),
  calendar: dynamic(() => import("./calendar/component")),
  calibreweb: dynamic(() => import("./calibreweb/component")),
  changedetectionio: dynamic(() => import("./changedetectionio/component")),
  channelsdvrserver: dynamic(() => import("./channelsdvrserver/component")),
  cloudflared: dynamic(() => import("./cloudflared/component")),
  coinmarketcap: dynamic(() => import("./coinmarketcap/component")),
  crowdsec: dynamic(() => import("./crowdsec/component")),
  iframe: dynamic(() => import("./iframe/component")),
  customapi: dynamic(() => import("./customapi/component")),
  deluge: dynamic(() => import("./deluge/component")),
  develancacheui: dynamic(() => import("./develancacheui/component")),
  diskstation: dynamic(() => import("./diskstation/component")),
  downloadstation: dynamic(() => import("./downloadstation/component")),
  docker: dynamic(() => import("./docker/component")),
  kubernetes: dynamic(() => import("./kubernetes/component")),
  emby: dynamic(() => import("./emby/component")),
  esphome: dynamic(() => import("./esphome/component")),
  evcc: dynamic(() => import("./evcc/component")),
  fileflows: dynamic(() => import("./fileflows/component")),
  firefly: dynamic(() => import("./firefly/component")),
  flood: dynamic(() => import("./flood/component")),
  freshrss: dynamic(() => import("./freshrss/component")),
  frigate: dynamic(() => import("./frigate/component")),
  fritzbox: dynamic(() => import("./fritzbox/component")),
  gamedig: dynamic(() => import("./gamedig/component")),
  gatus: dynamic(() => import("./gatus/component")),
  ghostfolio: dynamic(() => import("./ghostfolio/component")),
  gitea: dynamic(() => import("./gitea/component")),
  gitlab: dynamic(() => import("./gitlab/component")),
  glances: dynamic(() => import("./glances/component")),
  gluetun: dynamic(() => import("./gluetun/component")),
  gotify: dynamic(() => import("./gotify/component")),
  grafana: dynamic(() => import("./grafana/component")),
  hdhomerun: dynamic(() => import("./hdhomerun/component")),
  headscale: dynamic(() => import("./headscale/component")),
  hoarder: dynamic(() => import("./hoarder/component")),
  peanut: dynamic(() => import("./peanut/component")),
  homeassistant: dynamic(() => import("./homeassistant/component")),
  homebox: dynamic(() => import("./homebox/component")),
  homebridge: dynamic(() => import("./homebridge/component")),
  healthchecks: dynamic(() => import("./healthchecks/component")),
  immich: dynamic(() => import("./immich/component")),
  jackett: dynamic(() => import("./jackett/component")),
  jdownloader: dynamic(() => import("./jdownloader/component")),
  jellyfin: dynamic(() => import("./emby/component")),
  jellyseerr: dynamic(() => import("./jellyseerr/component")),
  kavita: dynamic(() => import("./kavita/component")),
  komga: dynamic(() => import("./komga/component")),
  kopia: dynamic(() => import("./kopia/component")),
  lidarr: dynamic(() => import("./lidarr/component")),
  linkwarden: dynamic(() => import("./linkwarden/component")),
  lubelogger: dynamic(() => import("./lubelogger/component")),
  mailcow: dynamic(() => import("./mailcow/component")),
  mastodon: dynamic(() => import("./mastodon/component")),
  mealie: dynamic(() => import("./mealie/component")),
  medusa: dynamic(() => import("./medusa/component")),
  minecraft: dynamic(() => import("./minecraft/component")),
  miniflux: dynamic(() => import("./miniflux/component")),
  mikrotik: dynamic(() => import("./mikrotik/component")),
  mjpeg: dynamic(() => import("./mjpeg/component")),
  moonraker: dynamic(() => import("./moonraker/component")),
  mylar: dynamic(() => import("./mylar/component")),
  myspeed: dynamic(() => import("./myspeed/component")),
  navidrome: dynamic(() => import("./navidrome/component")),
  netalertx: dynamic(() => import("./netalertx/component")),
  netdata: dynamic(() => import("./netdata/component")),
  nextcloud: dynamic(() => import("./nextcloud/component")),
  nextdns: dynamic(() => import("./nextdns/component")),
  npm: dynamic(() => import("./npm/component")),
  nzbget: dynamic(() => import("./nzbget/component")),
  octoprint: dynamic(() => import("./octoprint/component")),
  omada: dynamic(() => import("./omada/component")),
  ombi: dynamic(() => import("./ombi/component")),
  opendtu: dynamic(() => import("./opendtu/component")),
  opnsense: dynamic(() => import("./opnsense/component")),
  overseerr: dynamic(() => import("./overseerr/component")),
  openmediavault: dynamic(() => import("./openmediavault/component")),
  openwrt: dynamic(() => import("./openwrt/component")),
  paperlessngx: dynamic(() => import("./paperlessngx/component")),
  pfsense: dynamic(() => import("./pfsense/component")),
  photoprism: dynamic(() => import("./photoprism/component")),
  proxmoxbackupserver: dynamic(() => import("./proxmoxbackupserver/component")),
  pialert: dynamic(() => import("./netalertx/component")),
  pihole: dynamic(() => import("./pihole/component")),
  plantit: dynamic(() => import("./plantit/component")),
  plex: dynamic(() => import("./plex/component")),
  portainer: dynamic(() => import("./portainer/component")),
  prometheus: dynamic(() => import("./prometheus/component")),
  prometheusmetric: dynamic(() => import("./prometheusmetric/component")),
  prowlarr: dynamic(() => import("./prowlarr/component")),
  proxmox: dynamic(() => import("./proxmox/component")),
  pterodactyl: dynamic(() => import("./pterodactyl/component")),
  pyload: dynamic(() => import("./pyload/component")),
  qbittorrent: dynamic(() => import("./qbittorrent/component")),
  qnap: dynamic(() => import("./qnap/component")),
  radarr: dynamic(() => import("./radarr/component")),
  readarr: dynamic(() => import("./readarr/component")),
  romm: dynamic(() => import("./romm/component")),
  rutorrent: dynamic(() => import("./rutorrent/component")),
  sabnzbd: dynamic(() => import("./sabnzbd/component")),
  scrutiny: dynamic(() => import("./scrutiny/component")),
  sonarr: dynamic(() => import("./sonarr/component")),
  speedtest: dynamic(() => import("./speedtest/component")),
  spoolman: dynamic(() => import("./spoolman/component")),
  stash: dynamic(() => import("./stash/component")),
  stocks: dynamic(() => import("./stocks/component")),
  strelaysrv: dynamic(() => import("./strelaysrv/component")),
  swagdashboard: dynamic(() => import("./swagdashboard/component")),
  suwayomi: dynamic(() => import("./suwayomi/component")),
  tailscale: dynamic(() => import("./tailscale/component")),
  tandoor: dynamic(() => import("./tandoor/component")),
  tautulli: dynamic(() => import("./tautulli/component")),
  technitium: dynamic(() => import("./technitium/component")),
  tdarr: dynamic(() => import("./tdarr/component")),
  traefik: dynamic(() => import("./traefik/component")),
  transmission: dynamic(() => import("./transmission/component")),
  tubearchivist: dynamic(() => import("./tubearchivist/component")),
  truenas: dynamic(() => import("./truenas/component")),
  unifi: dynamic(() => import("./unifi/component")),
  unmanic: dynamic(() => import("./unmanic/component")),
  uptimekuma: dynamic(() => import("./uptimekuma/component")),
  uptimerobot: dynamic(() => import("./uptimerobot/component")),
  urbackup: dynamic(() => import("./urbackup/component")),
  vikunja: dynamic(() => import("./vikunja/component")),
  watchtower: dynamic(() => import("./watchtower/component")),
  wgeasy: dynamic(() => import("./wgeasy/component")),
  whatsupdocker: dynamic(() => import("./whatsupdocker/component")),
  xteve: dynamic(() => import("./xteve/component")),
  zabbix: dynamic(() => import("./zabbix/component")),
};

export default components;
