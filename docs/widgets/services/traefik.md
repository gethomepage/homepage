---
title: Traefik
description: Traefik Widget Configuration
---

Learn more about [Traefik](https://github.com/traefik/traefik).

No extra configuration is required.
If your traefik install requires authentication, include the username and password used to login to the web interface.

Allowed fields: `["routers", "services", "middleware"]`.

```yaml
widget:
  type: traefik
  url: http://traefik.host.or.ip
  username: username # optional
  password: password # optional
```
