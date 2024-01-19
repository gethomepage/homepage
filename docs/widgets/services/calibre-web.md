---
title: Calibre-web
description: Calibre-web Widget Configuration
---

[Calibre-web](https://github.com/janeczku/calibre-web) - Web app for browsing, reading and downloading eBooks stored in a Calibre database.

**Note: widget requires calibre-web ≥ v0.6.21.**

Allowed fields: `["books", "authors", "categories", "series"]`.

```yaml
widget:
  type: calibreweb
  url: http://your.calibreweb.host:port
  username: username
  password: password
```
