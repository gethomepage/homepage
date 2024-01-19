---
title: Bazarr
description: Bazarr Widget Configuration
---

[Bazarr](https://github.com/morpheus65535/bazarr) - Bazarr is a companion application to Sonarr and Radarr. It manages and downloads subtitles based on your requirements. You define your preferences by TV show or movie and Bazarr takes care of everything for you.

Find your API key under `Settings > General`.

Allowed fields: `["missingEpisodes", "missingMovies"]`.

```yaml
widget:
  type: bazarr
  url: http://bazarr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
