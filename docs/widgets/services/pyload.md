---
title: Pyload
description: Pyload Widget Configuration
---

Learn more about [Pyload](https://github.com/pyload/pyload).

Allowed fields: `["speed", "active", "queue", "total"]`.

```yaml
widget:
  type: pyload
  url: http://pyload.host.or.ip:port
  username: username
  password: password # only needed if username is set
  key: apikey # newer 0.5.0 versions uses API keys not username/password
```
