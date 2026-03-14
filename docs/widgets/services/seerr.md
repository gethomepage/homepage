---
title: Seerr Widget
description: Seerr Widget Configuration
---

Learn more about [Seerr](https://github.com/seerr-team/seerr).

Find your API key under `Settings > General > API Key`.

_Jellyseerr and Overseerr merged into Seerr. Use `type: seerr` (legacy `type: jellyseerr` and `type: overseerr` are aliased)._

Allowed fields: `["pending", "approved", "available", "completed", "processing", "issues"]`.
Default fields: `["pending", "approved", "completed"]`.

```yaml
widget:
  type: seerr
  url: http://seerr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
