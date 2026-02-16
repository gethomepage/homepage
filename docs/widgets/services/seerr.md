---
title: Seerr Widget
description: Seerr Widget Configuration
---

Learn more about [Seerr](https://github.com/seerr-team/seerr).

Find your API key under `Settings > General > API Key`.

_Note that Jellyseerr was merged with Overseerr and renamed Seerr. Use `type: seerr` (legacy `type: jellyseerr` is aliased)._

Allowed fields: `["pending", "approved", "available", "completed", "issues"]`.
Default fields: `["pending", "approved", "completed"]`.

```yaml
widget:
  type: seerr
  url: http://seerr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
