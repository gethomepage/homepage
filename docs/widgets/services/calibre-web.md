---
title: Calibre-web
description: Calibre-web Widget Configuration
---

**Note: this widget requires a feature of calibre-web that has not yet been distributed in versioned release. The code is contained in ["nightly" lsio builds after 25/8/23](https://hub.docker.com/layers/linuxserver/calibre-web/nightly/images/sha256-b27cbe5d17503de38135d925e226eb3e5ba04c558dbc865dc85d77824d35d7e2) or running the calibre-web source code including commit [0499e57](https://github.com/janeczku/calibre-web/commit/0499e578cdd45db656da34cd2d7152c8d88ceb23).**

Allowed fields: `["books", "authors", "categories", "series"]`.

```yaml
widget:
  type: calibreweb
  url: http://your.calibreweb.host:port
  username: username
  password: password
```
