---
title: Jellyfin
description: Jellyfin Widget Configuration
---

Learn more about [Jellyfin](https://github.com/jellyfin/jellyfin).

You can create an API key from inside Jellyfin at `Settings > Advanced > Api Keys`.

As of v0.6.11 the widget supports fields `["movies", "series", "episodes", "songs"]`. These blocks are disabled by default but can be enabled with the `enableBlocks` option, and the "Now Playing" feature (enabled by default) can be disabled with the `enableNowPlaying` option.

| Jellyfin Version | Homepage Widget Version |
| ---------------- | ----------------------- |
| < 10.12          | 1 (default)             |
| >= 10.12         | 2                       |

```yaml
widget:
  type: jellyfin
  url: http://jellyfin.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  version: 2 # optional, default is 1
  enableBlocks: true # optional, defaults to false
  enableNowPlaying: true # optional, defaults to true
  enableUser: true # optional, defaults to false
  enableMediaControl: false # optional, defaults to true
  showEpisodeNumber: true # optional, defaults to false
  expandOneStreamToTwoRows: false # optional, defaults to true
```
