import dynamic from "next/dynamic";

const components = {
  overseerr: dynamic(() => import("./overseerr/component")),
  radarr: dynamic(() => import("./radarr/component")),
};

export default components;
