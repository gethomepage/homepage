---
title: Emby
description: Emby Widget Configuration
---

Learn more about [Emby](https://github.com/MediaBrowser/Emby).

You can create an API key from inside Emby at `Settings > Advanced > Api Keys`.

As of v0.6.11 the widget supports fields `["movies", "series", "episodes", "songs"]`. These blocks are disabled by default but can be enabled with the `enableBlocks` option, and the "Now Playing" feature (enabled by default) can be disabled with the `enableNowPlaying` option.

```yaml
widget:
  type: emby
  url: http://emby.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  enableBlocks: true # optional, defaults to false
  enableNowPlaying: true # optional, defaults to true
```
