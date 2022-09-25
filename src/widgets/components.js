import dynamic from "next/dynamic";

const components = {
  adguard: dynamic(() => import("./adguard/component")),
  bazarr: dynamic(() => import("./bazarr/component")),
  coinmarketcap: dynamic(() => import("./coinmarketcap/component")),
  overseerr: dynamic(() => import("./overseerr/component")),
  radarr: dynamic(() => import("./radarr/component")),
  sonarr: dynamic(() => import("./sonarr/component")),
};

export default components;
