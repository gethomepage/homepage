import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";
import genericProxyHandler from "utils/proxy/handlers/generic";
import widgets from "widgets/widgets";

const logger = createLogger("navidromeProxyHandler");
const ALBUM_PAGE_SIZE = 500;

function sanitizeNavidromeURL(url) {
  const sanitized = new URL(sanitizeErrorURL(url));
  ["u", "t", "s"].forEach((key) => {
    if (sanitized.searchParams.has(key)) sanitized.searchParams.set(key, "***");
  });
  return sanitized.toString();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value) return [value];
  return [];
}

function parseJson(data) {
  if (!data) return {};
  if (Buffer.isBuffer(data)) return JSON.parse(Buffer.from(data).toString());
  if (typeof data === "string") return JSON.parse(data);
  return data;
}

async function callNavidrome(widget, endpoint, queryParams) {
  const url = new URL(formatApiCall(widgets[widget.type].api, { endpoint, ...widget }));
  Object.entries(queryParams ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const [status, , data] = await httpProxy(url);
  const parsed = parseJson(data);

  if (status >= 400 || parsed?.["subsonic-response"]?.error) {
    return {
      error: {
        status,
        data: parsed?.["subsonic-response"]?.error ?? parsed,
        url: sanitizeNavidromeURL(url),
      },
    };
  }

  return { data: parsed?.["subsonic-response"] ?? parsed };
}

function countArtists(indexes) {
  return asArray(indexes?.index).reduce((total, index) => total + asArray(index.artist).length, 0);
}

function summarizeAlbums(albumList) {
  const albums = asArray(albumList?.album);
  const songCounts = albums.map((album) => Number(album.songCount));
  const hasReliableSongCounts = songCounts.every((songCount) => Number.isFinite(songCount));

  return {
    albums: albums.length,
    songs: hasReliableSongCounts ? songCounts.reduce((total, songCount) => total + songCount, 0) : null,
  };
}

function countPlaylists(playlists) {
  return asArray(playlists?.playlist).length;
}

async function safeCall(widget, endpoint, queryParams) {
  try {
    return await callNavidrome(widget, endpoint, queryParams);
  } catch (error) {
    if (error) logger.error(error);
    return { error: { status: 500, data: { message: "Unexpected error" } } };
  }
}

async function getAlbumStats(widget) {
  const albums = [];
  const seenPageKeys = new Set();

  for (let offset = 0; ; offset += ALBUM_PAGE_SIZE) {
    const result = await safeCall(widget, "getAlbumList2", {
      type: "alphabeticalByName",
      size: ALBUM_PAGE_SIZE,
      offset,
    });

    if (result.error) return result;

    const pageAlbums = asArray(result.data?.albumList2?.album);
    const pageKey = pageAlbums.map((album) => album.id ?? album.name).join("|");
    if (pageAlbums.length && seenPageKeys.has(pageKey)) {
      return { error: { status: 502, data: { message: "Navidrome album pagination did not advance" } } };
    }
    seenPageKeys.add(pageKey);
    albums.push(...pageAlbums);

    if (pageAlbums.length < ALBUM_PAGE_SIZE) {
      return { data: { albumList2: { album: albums } } };
    }
  }
}

async function getLibraryStats(widget) {
  const [artistsResult, albumsResult, playlistsResult] = await Promise.all([
    safeCall(widget, "getIndexes"),
    getAlbumStats(widget),
    safeCall(widget, "getPlaylists"),
  ]);

  const errors = [artistsResult.error, albumsResult.error, playlistsResult.error].filter(Boolean);
  if (errors.length === 3) {
    return { error: errors[0] };
  }

  const albumStats = albumsResult.data ? summarizeAlbums(albumsResult.data.albumList2) : {};

  return {
    stats: {
      artists: artistsResult.data ? countArtists(artistsResult.data.indexes) : null,
      albums: albumStats.albums ?? null,
      songs: albumStats.songs ?? null,
      playlists: playlistsResult.data ? countPlaylists(playlistsResult.data.playlists) : null,
    },
  };
}

export default async function navidromeProxyHandler(req, res, map) {
  if (req.query.endpoint !== "libraryStats") {
    return genericProxyHandler(req, res, map);
  }

  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);

  if (!widget || !widgets?.[widget.type]?.api) {
    logger.debug("Invalid or missing proxy service type '%s' in group '%s'", service, group);
    return res.status(403).json({ error: "Service does not support API calls" });
  }

  try {
    const { stats, error } = await getLibraryStats(widget);
    if (error) {
      return res.status(error.status || 500).json({ error });
    }

    return res.status(200).json(stats);
  } catch (error) {
    if (error) logger.error(error);
    return res.status(500).json({ error: { message: "Unexpected error" } });
  }
}
