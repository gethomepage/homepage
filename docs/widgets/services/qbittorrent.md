---
title: qBittorrent
description: qBittorrent Widget Configuration
---

Uses the same username and password used to login from the web.

Allowed fields: `["leech", "download", "seed", "upload", "total", "error",
"checking", "moving", "activeDl", "activeUl", "active", "paused", "queued",
"stalled"]`.

```yaml
widget:
  type: qbittorrent
  url: http://qbittorrent.host.or.ip
  username: username
  password: password
```
