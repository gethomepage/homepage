// const formats = {
//   emby: `{url}/emby/{endpoint}?api_key={key}`,
//   jellyfin: `{url}/emby/{endpoint}?api_key={key}`,
//   pihole: `{url}/admin/{endpoint}`,
//   speedtest: `{url}/api/{endpoint}`,
//   tautulli: `{url}/api/v2?apikey={key}&cmd={endpoint}`,
//   traefik: `{url}/api/{endpoint}`,
//   portainer: `{url}/api/endpoints/{env}/{endpoint}`,
//   rutorrent: `{url}/plugins/httprpc/action.php`,
//   transmission: `{url}/transmission/rpc`,
//   qbittorrent: `{url}/api/v2/{endpoint}`,
//   jellyseerr: `{url}/api/v1/{endpoint}`,
//   ombi: `{url}/api/v1/{endpoint}`,
//   npm: `{url}/api/{endpoint}`,
//   lidarr: `{url}/api/v1/{endpoint}?apikey={key}`,
//   readarr: `{url}/api/v1/{endpoint}?apikey={key}`,
//   sabnzbd: `{url}/api/?apikey={key}&output=json&mode={endpoint}`,
//   gotify: `{url}/{endpoint}`,
//   prowlarr: `{url}/api/v1/{endpoint}`,
//   jackett: `{url}/api/v2.0/{endpoint}?apikey={key}&configured=true`,
//   strelaysrv: `{url}/{endpoint}`,
//   mastodon: `{url}/api/v1/{endpoint}`,
// };

export function formatApiCall(url, args) {
  const find = /\{.*?\}/g;
  const replace = (match) => {
    const key = match.replace(/\{|\}/g, "");
    return args[key];
  };

  return url.replace(find, replace);
}

export function formatProxyUrl(widget, endpoint, endpointParams) {
  const params = new URLSearchParams({
    type: widget.type,
    group: widget.service_group,
    service: widget.service_name,
    endpoint,
  });
  if (endpointParams) {
    params.append("params", JSON.stringify(endpointParams));
  }
  return `/api/services/proxy?${params.toString()}`;
}

export function asJson(data) {
  if (data?.length > 0) {
    const json = JSON.parse(data.toString());
    return json;
  }
  return data;
}

export function jsonArrayTransform(data, transform) {
  const json = asJson(data);
  if (json instanceof Array) {
    return transform(json);
  }
  return json;
}

export function jsonArrayFilter(data, filter) {
  return jsonArrayTransform(data, (items) => items.filter(filter));
}
