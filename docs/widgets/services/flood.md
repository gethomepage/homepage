---
title: Flood
description: Flood Widget Configuration
---

[Flood](https://github.com/jesec/flood) - A modern web UI for various torrent clients with a Node.js backend and React frontend.

Allowed fields: `["leech", "download", "seed", "upload"]`.

```yaml
widget:
  type: flood
  url: http://flood.host.or.ip
  username: username # if set
  password: password # if set
```
