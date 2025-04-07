---
title: Dockwatch
description: Dockwatch Widget Configuration
---

Learn more about [Dockwatch](https://github.com/Notifiarr/dockwatch).

Generate an API key for your user at `Settings > DOCKWATCH SERVERS > API KEY.`

Allowed fields: `["running", "stopped", "total", "healthy", "unhealthy", "unknown", "uptodate", "outdated", "unchecked", "disk", "cpu", "memory", "netIO"] (maximum of 4).`

```yaml
widget:
  type: dockwatch
  url: http://dockwatch.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
