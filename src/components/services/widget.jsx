import { useTranslation } from "react-i18next";

import Sonarr from "./widgets/service/sonarr";
import Radarr from "./widgets/service/radarr";
import Lidarr from "./widgets/service/lidarr";
import Readarr from "./widgets/service/readarr";
import Bazarr from "./widgets/service/bazarr";
import Ombi from "./widgets/service/ombi";
import Portainer from "./widgets/service/portainer";
import Emby from "./widgets/service/emby";
import Nzbget from "./widgets/service/nzbget";
import SABnzbd from "./widgets/service/sabnzbd";
import Transmission from "./widgets/service/transmission";
import QBittorrent from "./widgets/service/qbittorrent";
import Docker from "./widgets/service/docker";
import Pihole from "./widgets/service/pihole";
import Rutorrent from "./widgets/service/rutorrent";
import Jellyfin from "./widgets/service/jellyfin";
import Speedtest from "./widgets/service/speedtest";
import Traefik from "./widgets/service/traefik";
import Jellyseerr from "./widgets/service/jellyseerr";
import Overseerr from "./widgets/service/overseerr";
import Npm from "./widgets/service/npm";
import Tautulli from "./widgets/service/tautulli";
import CoinMarketCap from "./widgets/service/coinmarketcap";
import Gotify from "./widgets/service/gotify";
import Prowlarr from "./widgets/service/prowlarr";
import Jackett from "./widgets/service/jackett";
import AdGuard from "./widgets/service/adguard";

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
