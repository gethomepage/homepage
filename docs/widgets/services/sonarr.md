---
title: Sonarr
description: Sonarr Widget Configuration
---

Learn more about [Sonarr](https://github.com/Sonarr/Sonarr).

Find your API key under `Settings > General`.

Allowed fields: `["wanted", "queued", "series"]`.

A detailed queue listing is disabled by default, but can be enabled with the `enableQueue` option.

```yaml
widget:
  type: sonarr
  url: http://sonarr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  enableQueue: true # optional, defaults to false
```
