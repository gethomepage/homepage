---
title: Ombi
description: Ombi Widget Configuration
---

[Ombi](https://github.com/Ombi-app/Ombi) - Want a Movie or TV Show on Plex/Emby/Jellyfin? Use Ombi!

Find your API key under `Settings > Configuration > General`.

Allowed fields: `["pending", "approved", "available"]`.

```yaml
widget:
  type: ombi
  url: http://ombi.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
