---
title: Radarr
description: Radarr Widget Configuration
---

Learn more about [Radarr](https://github.com/Radarr/Radarr).

Find your API key under `Settings > General`.

Allowed fields: `["wanted", "missing", "queued", "movies"]`.

A detailed queue listing is disabled by default, but can be enabled with the `enableQueue` option.

```yaml
widget:
  type: radarr
  url: http://radarr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  enableQueue: true # optional, defaults to false
```
