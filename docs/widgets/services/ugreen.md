---
title: UGREEN NAS
description: UGREEN NAS Widget Configuration
---

Learn more about [UGREEN NAS](https://nas.ugreen.com/).

The UGREEN NAS widget provides system monitoring through the UGOS built-in API. Authentication uses the same credentials as the UGOS web interface.

Allowed fields: `["cpu", "mem", "uptime", "cpuTemp", "netRx", "netTx", "fanSpeed", "diskRead", "diskWrite"]`.

Up to 4 fields can be displayed at a time. The default fields are `cpu`, `mem`, `uptime`, and `cpuTemp`.

```yaml
widget:
  type: ugreen
  url: http://ugreen.host.or.ip:9999
  username: admin
  password: yourpassword
  fields: ["cpu", "mem", "uptime", "cpuTemp"] # optional, default shown
```
