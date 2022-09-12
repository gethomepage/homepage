const formats = {
  emby: `{url}/emby/{endpoint}?api_key={key}`,
  jellyfin: `{url}/emby/{endpoint}?api_key={key}`,
  pihole: `{url}/admin/{endpoint}`,
  radarr: `{url}/api/v3/{endpoint}?apikey={key}`,
  sonarr: `{url}/api/v3/{endpoint}?apikey={key}`,
  speedtest: `{url}/api/{endpoint}`,
  tautulli: `{url}/api/v2?apikey={key}&cmd={endpoint}`,
  traefik: `{url}/api/{endpoint}`,
  portainer: `{url}/api/endpoints/{env}/{endpoint}`,
  rutorrent: `{url}/plugins/httprpc/action.php`,
  jellyseerr: `{url}/api/v1/{endpoint}`,
  overseerr: `{url}/api/v1/{endpoint}`,
  ombi: `{url}/api/v1/{endpoint}`,
  npm: `{url}/api/{endpoint}`,
  readarr: `{url}/api/v1/{endpoint}?apikey={key}`,
  sabnzbd: `{url}/api/?apikey={key}&output=json&mode={endpoint}`,
  coinmarketcap: `https://pro-api.coinmarketcap.com/{endpoint}`,
  gotify: `{url}/{endpoint}`,
};

export function formatApiCall(api, args) {
  const find = /\{.*?\}/g;
  const replace = (match) => {
    const key = match.replace(/\{|\}/g, "");
    return args[key];
  };

  return formats[api].replace(find, replace);
}

export function formatApiUrl(widget, endpoint) {
  const params = new URLSearchParams({
    type: widget.type,
    group: widget.service_group,
    service: widget.service_name,
    endpoint,
  });
  return `/api/services/proxy?${params.toString()}`;
}
