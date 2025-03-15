---
title: Komga
description: Komga Widget Configuration
---

Learn more about [Komga](https://github.com/gotson/komga).

Uses the same username and password used to login from the web.

Allowed fields: `["libraries", "series", "books"]`.

| Komga API Version | Homepage Widget Version |
| ----------------- | ----------------------- |
| < v2              | 1 (default)             |
| >= v2             | 2                       |

```yaml
widget:
  type: komga
  url: http://komga.host.or.ip:port
  username: username
  password: password
  key: komgaapikey # optional
```
