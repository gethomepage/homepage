import dynamic from "next/dynamic";

const components = {
  overseerr: dynamic(() => import("./overseerr/component")),
  radarr: dynamic(() => import("./radarr/component")),
  sonarr: dynamic(() => import("./sonarr/component")),
};

export default components;
