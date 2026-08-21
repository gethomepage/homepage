import cache from "memory-cache";

import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import widgets from "widgets/widgets";

const proxyName = "bookorbitProxyHandler";
const sessionTokenCacheKey = `${proxyName}__sessionToken`;
const logger = createLogger(proxyName);

// BookOrbit access tokens are short lived - 15 minutes by default, and the lifetime is
// deployment configurable - so the cache follows each token's own expiry instead of a
// fixed duration, refreshing a minute early.
const defaultTokenTtl = 10 * 60 * 1000;
const tokenExpiryMargin = 60 * 1000;

function tokenCacheTtl(accessToken) {
  try {
    const [, payload] = accessToken.split(".");
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());

    if (Number.isFinite(exp)) {
      return exp * 1000 - Date.now() - tokenExpiryMargin;
    }
  } catch (e) {
    logger.debug("Unable to read the expiry of the BookOrbit access token: %s", e);
  }

  return defaultTokenTtl;
}

async function login(widget, service) {
  if (!widget.username || !widget.password) {
    logger.debug("Missing credentials for BookOrbit service '%s'", service);
    return { accessToken: false };
  }

  const api = widgets?.[widget.type]?.api;
  const loginUrl = new URL(formatApiCall(api, { ...widget, endpoint: "auth/login" }));

  const [status, , data] = await httpProxy(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      username: widget.username,
      password: widget.password,
    }),
  });

  if (status !== 200) {
    logger.debug("BookOrbit login failed for service '%s' with status %d", service, status);
    return { accessToken: false };
  }

  try {
    const { accessToken } = JSON.parse(data.toString());

    if (accessToken) {
      const ttl = tokenCacheTtl(accessToken);

      if (ttl > 0) {
        cache.put(`${sessionTokenCacheKey}.${service}`, accessToken, ttl);
      }

      return { accessToken };
    }
  } catch (e) {
    logger.error("Unable to login to BookOrbit API: %s", e);
  }

  return { accessToken: false };
}

async function apiCall(widget, endpoint, service) {
  const cacheKey = `${sessionTokenCacheKey}.${service}`;
  let accessToken = cache.get(cacheKey);

  if (!accessToken) {
    ({ accessToken } = await login(widget, service));
  }

  if (!accessToken) {
    return { status: 401, data: null };
  }

  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const url = new URL(formatApiCall(widgets[widget.type].api, { ...widget, endpoint }));
  let [status, , data] = await httpProxy(url, {
    method: "GET",
    headers,
  });

  if (status === 401 || status === 403) {
    logger.debug("BookOrbit API rejected the request, attempting to obtain new session token");
    const refreshedToken = (await login(widget, service)).accessToken;
    if (!refreshedToken) {
      return { status, data: null };
    }
    headers.Authorization = `Bearer ${refreshedToken}`;
    [status, , data] = await httpProxy(url, {
      method: "GET",
      headers,
    });
  }

  if (status !== 200) {
    logger.error("Error getting data from BookOrbit: %s status %d. Data: %s", url, status, data);
    return { status, data: null };
  }

  try {
    return { status, data: JSON.parse(data.toString()) };
  } catch (e) {
    logger.error("Error parsing BookOrbit response: %s", e);
  }

  return { status, data: null };
}

// BookOrbit derives a book's media kind from its file format; the same sets classify a
// whole library from the format counts its stats endpoint returns.
const audioFormats = new Set(["m4b", "mp3", "m4a", "opus", "ogg", "flac"]);
const comicFormats = new Set(["cbz", "cbr", "cb7", "cbx"]);

function mediaKind(formatCounts) {
  let audio = 0;
  let comic = 0;
  let ebook = 0;

  for (const [format, count] of Object.entries(formatCounts ?? {})) {
    const files = count ?? 0;
    if (audioFormats.has(format.toLowerCase())) audio += files;
    else if (comicFormats.has(format.toLowerCase())) comic += files;
    else ebook += files;
  }

  if (audio + comic + ebook === 0) return null;
  if (audio > comic && audio > ebook) return "audiobook";
  if (comic > audio && comic > ebook) return "comic";
  return "ebook";
}

/**
 * Resolves the widget's `libraries` option against the instance's libraries.
 *
 * Entries match a library by name (case insensitive) or by id, so a config can read
 * `libraries: [Comics, Magazines]`. Returns null when the option is absent or set to
 * `all`, meaning the widget covers every library the account can see.
 */
function selectLibraries(widget, libraries) {
  const configured = widget.libraries;

  if (configured === undefined || configured === null || configured === "") {
    return null;
  }

  const wanted = (Array.isArray(configured) ? configured : configured.toString().split(","))
    .map((entry) => entry.toString().trim().toLowerCase())
    .filter((entry) => entry.length > 0);

  if (wanted.length === 0 || (wanted.length === 1 && wanted[0] === "all")) {
    return null;
  }

  return libraries.filter(
    (library) => wanted.includes(library.id?.toString()) || wanted.includes(library.name?.toLowerCase()),
  );
}

export default async function bookorbitProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  if (!widget.username || !widget.password) {
    logger.debug("Missing credentials for BookOrbit widget in service '%s'", service);
    return res.status(400).json({ error: "Missing BookOrbit credentials" });
  }

  // The calls are made in sequence so that a cold cache only triggers a single login;
  // BookOrbit throttles its login endpoint to five attempts a minute.
  const { data: librariesData, status: librariesStatus } = await apiCall(widget, "libraries", service);

  if (librariesStatus !== 200 || !Array.isArray(librariesData)) {
    return res.status(librariesStatus || 500).send(librariesData || { error: "Error fetching libraries" });
  }

  const selected = selectLibraries(widget, librariesData);

  if (selected?.length === 0) {
    logger.error("No BookOrbit library matches the libraries configured for service '%s'", service);
    return res.status(404).send({ error: "No matching BookOrbit libraries" });
  }

  let books = 0;
  const kinds = new Set();

  if (selected) {
    // Per-library stats are authoritative for a book count; a book carrying several
    // files would be counted once per format by the format distribution.
    for (const library of selected) {
      const { data: stats, status: statsStatus } = await apiCall(widget, `libraries/${library.id}/stats`, service);

      if (statsStatus !== 200 || !stats) {
        return res.status(statsStatus || 500).send(stats || { error: "Error fetching library stats" });
      }

      books += stats.totalBooks ?? 0;
      kinds.add(mediaKind(stats.formatCounts));
    }
  } else {
    const { data: overviewData, status: overviewStatus } = await apiCall(
      widget,
      "dashboard/widgets/library-overview",
      service,
    );

    if (overviewStatus !== 200 || !overviewData) {
      return res.status(overviewStatus || 500).send(overviewData || { error: "Error fetching library overview" });
    }

    books = overviewData.totalBooks ?? 0;
  }

  const summaryEndpoint = selected
    ? `user-statistics/summary?${selected.map((library) => `libraryIds=${library.id}`).join("&")}`
    : "user-statistics/summary";

  const { data: summaryData, status: summaryStatus } = await apiCall(widget, summaryEndpoint, service);

  if (summaryStatus !== 200 || !summaryData) {
    return res.status(summaryStatus || 500).send(summaryData || { error: "Error fetching reading statistics" });
  }

  const named = kinds.size === 1 ? [...kinds][0] : null;

  return res.status(200).send({
    libraries: (selected ?? librariesData).length,
    books,
    reading: summaryData.inProgressBooks ?? 0,
    finished: summaryData.completedBooks ?? 0,
    // `label` overrides the media kind the blocks would otherwise be named for.
    label: widget.label ?? undefined,
    // Only an unambiguous kind names the blocks; a mixed selection falls back to books.
    mediaKind: named ?? undefined,
  });
}
