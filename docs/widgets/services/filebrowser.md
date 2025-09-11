---
title: Filebrowser
description: Filebrowser Widget Configuration
---

Learn more about [Filebrowser](https://filebrowser.org).

If you are using [Proxy header authentication](https://filebrowser.org/configuration/authentication-method#proxy-header) you have to set `authHeader` and `username`.

Allowed fields: `["available", "used", "total"]`.

```yaml
widget:
  type: filebrowser
  url: http://filebrowserhostorip:port
  username: username
  password: password
  authHeader: X-My-Header # If using Proxy header authentication
```
