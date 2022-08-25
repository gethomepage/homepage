import Sonarr from "./widgets/service/sonarr";
import Radarr from "./widgets/service/radarr";
import Ombi from "./widgets/service/ombi";
import Portainer from "./widgets/service/portainer";
import Emby from "./widgets/service/emby";
import Nzbget from "./widgets/service/nzbget";
import Docker from "./widgets/service/docker";
import Pihole from "./widgets/service/pihole";
import Rutorrent from "./widgets/service/rutorrent";

const widgetMappings = {
  docker: Docker,
  sonarr: Sonarr,
  radarr: Radarr,
  ombi: Ombi,
  portainer: Portainer,
  emby: Emby,
  nzbget: Nzbget,
  pihole: Pihole,
  rutorrent: Rutorrent,
};

export default function Widget({ service }) {
  const ServiceWidget = widgetMappings[service.widget.type];

  if (ServiceWidget) {
    return <ServiceWidget service={service} />;
  }

  return (
    <div className="bg-theme-200/50 dark:bg-theme-900/20 rounded m-1 flex-1 flex flex-col items-center justify-center p-1">
      <div className="font-thin text-sm">
        Missing Widget Type: <strong>{service.widget.type}</strong>
      </div>
    </div>
  );
}
