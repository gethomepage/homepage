export function formatApiCall(url, args) {
  const find = /\{.*?\}/g;
  const replace = (match) => {
    const key = match.replace(/\{|\}/g, "");
    return args[key] || "";
  };

  return url.replace(/\/+$/, "").replace(find, replace).replace(find, replace);
}

function getURLSearchParams(widget, endpoint) {
  const params = new URLSearchParams({
    type: widget.type,
    group: widget.service_group,
    service: widget.service_name,
    endpoint,
  });
  return params;
}

export function formatProxyUrlWithSegments(widget, endpoint, segments) {
  const params = getURLSearchParams(widget, endpoint);
  if (segments) {
    params.append("segments", JSON.stringify(segments));
  }
  return `/api/services/proxy?${params.toString()}`;
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
  ["apikey", "api_key", "token", "t", "access_token"].forEach((key) => {
    if (url.searchParams.has(key)) url.searchParams.set(key, "***");
  });
  return url.toString();
}
