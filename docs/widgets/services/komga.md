---
title: Komga
description: Komga Widget Configuration
---

Learn more about [Komga](https://github.com/gotson/komga).

Recommended to create a new account with limited access for use with this widget.

Create an API key in Komga by opening the left panel, `My Account` -> `API Keys` and then click "GENERATE API KEY".
Or just use username and password (same username and password used to login from the web).

Allowed fields: `["libraries", "series", "books"]`.

```yaml
widget:
  type: komga
  url: http://komga.host.or.ip:port
  key: mytokenhere # See above for how to generate this
  # Or use username and password
  # username: username
  # password: password
```
