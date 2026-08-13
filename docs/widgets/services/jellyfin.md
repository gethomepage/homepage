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
| < 10.12          | 1 (default)             |
| >= 10.12         | 2                       |

```yaml
widget:
  type: jellyfin
  url: http://jellyfin.host.or.ip:port
  key: apikeyapikeyapikeyapikeyapikey
  version: 2 # optional, default is 1
  enableBlocks: true # optional, defaults to false
  enableNowPlaying: true # optional, defaults to true
  enableUser: true # optional, defaults to false
  enableMediaControl: false # optional, defaults to true
  showEpisodeNumber: true # optional, defaults to false
  expandOneStreamToTwoRows: false # optional, defaults to true
```
