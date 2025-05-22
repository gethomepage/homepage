---
title: Pelican
description: Pelican Widget Configuration
---

Learn more about [Pelican](https://pelican.dev/).

Allowed fields: `["nodes", "servers"]`.

When creating your API key, ensure that Server permissions and Node permissions are set to read only.

```yaml
widget:
  type: pelican
  url: http://pelicanhost:port
  key: pelicanapikey
```

If you encounter ``HTTP 500 Server Error Invalid IP address format`` then you have configured IP whitelisting in Pelican which is blacklisting your Homepage instance.