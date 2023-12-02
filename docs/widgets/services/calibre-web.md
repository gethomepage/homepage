---
title: Calibre-web
description: Calibre-web Widget Configuration
---

**Note: this widget requires a feature of calibre-web that has been recently introduced in version v0.6.21.**  
This release is present in [stable lsio releases](https://hub.docker.com/layers/linuxserver/calibre-web/0.6.21/images/sha256-0372548045dbb15be58f25538230ca09bb98be65d0b951f8be606bca7bf07f60) since November 25, 2023.

Allowed fields: `["books", "authors", "categories", "series"]`.

```yaml
widget:
  type: calibreweb
  url: http://your.calibreweb.host:port
  username: username
  password: password
```
