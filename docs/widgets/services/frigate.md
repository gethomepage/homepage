---
title: Frigate
description: Frigate Widget Configuration
---

Learn more about [Frigate](https://frigate.video/).

Allowed fields: `["cameras", "uptime", "version"]`.

A recent event listing is disabled by default, but can be enabled with the `enableRecentEvents` option.

```yaml
widget:
  type: frigate
  url: http://frigate.host.or.ip:port
  enableRecentEvents: true # Optional, defaults to false
```
