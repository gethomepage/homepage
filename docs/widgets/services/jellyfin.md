---
title: Jellyfin
description: Jellyfin Widget Configuration
---

Learn more about [Jellyfin](https://github.com/jellyfin/jellyfin).

You can create an API key from inside the Jellyfin Administration Dashboard under `Advanced > API Keys`.

By default blocks are disabled and 'Now Playing' is enabled. You can toggle these settings using the enableBlocks and enableNowPlaying options.

Allowed fields: `["movies", "series", "episodes", "songs", "albums"]`.

| Jellyfin Version | Homepage Widget Version |
| ---------------- | ----------------------- |
| < 12.0           | 1                       |
| >= 12.0          | 2 (default)             |

Jellyfin 12.0 removed the legacy `/emby/` endpoint prefix and `?api_key=` query parameter authentication. If you are running Jellyfin < 12.0, set `version: 1` explicitly.

```yaml
widget:
  type: jellyfin
  url: http://jellyfin.host.or.ip:port
  key: apikeyapikeyapikeyapikeyapikey
  version: 2 # optional, default is 2 (set to 1 for Jellyfin < 12.0)
  enableBlocks: true # optional, defaults to false
  enableNowPlaying: true # optional, defaults to true
  enableUser: true # optional, defaults to false
  enableMediaControl: false # optional, defaults to true
  showEpisodeNumber: true # optional, defaults to false
  expandOneStreamToTwoRows: false # optional, defaults to true
```
