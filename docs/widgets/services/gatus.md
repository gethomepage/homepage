---
title: Gatus
description: Gatus Widget Configuration
---

Allowed fields: `["up", "down", "uptime"]`.

```yaml
widget:
  type: gatus
  url: http://gatus.host.or.ip:[port]
  username: <username> # required if basic auth is configured in Gatus
  password: <password> # required if basic auth is configured in Gatus
```
