---
title: Pyload
description: Pyload Widget Configuration
---

[Pyload](https://github.com/pyload/pyload) - The free and open-source Download Manager written in pure Python.

Allowed fields: `["speed", "active", "queue", "total"]`.

```yaml
widget:
  type: pyload
  url: http://pyload.host.or.ip:port
  username: username
  password: password # only needed if set
```
