export function formatApiCall(url, args) {
  const find = /\{.*?\}/g;
  const replace = (match) => {
    const key = match.replace(/\{|\}/g, "");
    return args[key] || "";
  };

  return url.replace(/\/+$/, "").replace(find, replace).replace(find, replace);
}

export function getURLSearchParams(widget, endpoint) {
  const params = new URLSearchParams({
    group: widget.service_group,
    service: widget.service_name,
  });
  if (endpoint) {
    params.append("endpoint", endpoint);
  }
  return params;
}

export function formatProxyUrl(widget, endpoint, queryParams) {
  const params = getURLSearchParams(widget, endpoint);
  if (queryParams) {
    params.append("query", JSON.stringify(queryParams));
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

export function sanitizeErrorURL(errorURL) {
  // Dont display sensitive params on frontend
  const url = new URL(errorURL);
  ["apikey", "api_key", "token", "t", "access_token", "auth"].forEach((key) => {
    if (url.searchParams.has(key)) url.searchParams.set(key, "***");
    if (url.hash.includes(key)) url.hash = url.hash.replace(new RegExp(`${key}=[^&]+`), `${key}=***`);
  });
  return url.toString();
}
