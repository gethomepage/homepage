---
title: Komodo
description: Komodo Widget Configuration
---

This widget shows the summary of containers managed by [Komodo](https://komo.do/). See the [komodo docs](https://docs.rs/komodo_client/latest/komodo_client/api/index.html) for api key and secret.

Allowed fields (max 4): `["total", "running", "stopped", "unhealthy", "unknown"]`.

```yaml
widget:
  type: komodo
  url: http://komodo.hostname.or.ip:port
  key: K-xxxxxx...
  secret: S-xxxxxx...
```
