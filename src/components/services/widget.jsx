import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";

const Sonarr = dynamic(() => import("./widgets/service/sonarr"));
const Radarr = dynamic(() => import("./widgets/service/radarr"));
const Lidarr = dynamic(() => import("./widgets/service/lidarr"));
const Readarr = dynamic(() => import("./widgets/service/readarr"));
const Bazarr = dynamic(() => import("./widgets/service/bazarr"));
const Ombi = dynamic(() => import("./widgets/service/ombi"));
const Portainer = dynamic(() => import("./widgets/service/portainer"));
const Emby = dynamic(() => import("./widgets/service/emby"));
const Nzbget = dynamic(() => import("./widgets/service/nzbget"));
const SABnzbd = dynamic(() => import("./widgets/service/sabnzbd"));
const Transmission = dynamic(() => import("./widgets/service/transmission"));
const QBittorrent = dynamic(() => import("./widgets/service/qbittorrent"));
const Docker = dynamic(() => import("./widgets/service/docker"));
const Pihole = dynamic(() => import("./widgets/service/pihole"));
const Rutorrent = dynamic(() => import("./widgets/service/rutorrent"));
const Jellyfin = dynamic(() => import("./widgets/service/jellyfin"));
const Speedtest = dynamic(() => import("./widgets/service/speedtest"));
const Traefik = dynamic(() => import("./widgets/service/traefik"));
const Jellyseerr = dynamic(() => import("./widgets/service/jellyseerr"));
const Overseerr = dynamic(() => import("./widgets/service/overseerr"));
const Npm = dynamic(() => import("./widgets/service/npm"));
const Tautulli = dynamic(() => import("./widgets/service/tautulli"));
const CoinMarketCap = dynamic(() => import("./widgets/service/coinmarketcap"));
const Gotify = dynamic(() => import("./widgets/service/gotify"));
const Prowlarr = dynamic(() => import("./widgets/service/prowlarr"));
const Jackett = dynamic(() => import("./widgets/service/jackett"));
const AdGuard = dynamic(() => import("./widgets/service/adguard"));
const StRelaySrv = dynamic(() => import("./widgets/service/strelaysrv"));
const Mastodon = dynamic(() => import("./widgets/service/mastodon"));

const widgetMappings = {
  docker: Docker,
  sonarr: Sonarr,
  radarr: Radarr,
  lidarr: Lidarr,
  readarr: Readarr,
  bazarr: Bazarr,
  ombi: Ombi,
  portainer: Portainer,
  emby: Emby,
  jellyfin: Jellyfin,
  nzbget: Nzbget,
  sabnzbd: SABnzbd,
  transmission: Transmission,
  qbittorrent: QBittorrent,
  pihole: Pihole,
  rutorrent: Rutorrent,
  speedtest: Speedtest,
  traefik: Traefik,
  jellyseerr: Jellyseerr,
  overseerr: Overseerr,
  coinmarketcap: CoinMarketCap,
  npm: Npm,
  tautulli: Tautulli,
  gotify: Gotify,
  prowlarr: Prowlarr,
  jackett: Jackett,
  adguard: AdGuard,
  strelaysrv: StRelaySrv,
  mastodon: Mastodon,
};

export default function Widget({ service }) {
  const { t } = useTranslation("common");

  const ServiceWidget = widgetMappings[service.widget.type];

  if (ServiceWidget) {
    return <ServiceWidget service={service} />;
  }

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
      <div className="font-thin text-sm">{t("widget.missing_type", { type: service.widget.type })}</div>
    </div>
  );
}
