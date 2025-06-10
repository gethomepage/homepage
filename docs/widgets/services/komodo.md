---
title: Komodo
description: Komodo Widget Configuration
---

This widget shows the summary of Stacks managed by [Komodo](https://komo.do/).

This widget requires an API Key and Secret, which can be setup at: `http://komodo.hostname.or.ip:port/settings`.

Allowed fields: `["total", "running", "stopped", "down", "unhealthy", "unknown"]`.

```yaml
widget:
  type: komodo
  url: http://komodo.hostname.or.ip:port
  key: K-xxxxxx...
  secret: S-xxxxxx...
```
