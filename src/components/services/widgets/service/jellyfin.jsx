import Emby from "./emby";

// Jellyfin and Emby share the same API, so proxy the Emby widget to Jellyfin.
export default function Jellyfin({ service }) {
  return <Emby service={service} title="Jellyfin" />;
}
