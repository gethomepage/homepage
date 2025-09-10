---
title: Traefik
description: Traefik Widget Configuration
---

Learn more about [Traefik](https://github.com/traefik/traefik).

No extra configuration is required.
If your traefik install requires authentication, include the username and password used to login to the web interface.

If you get an API Error then you may need to set `--api.insecure=false` to support this: <https://doc.traefik.io/traefik/master/operations/api/#insecure>

Allowed fields: `["routers", "services", "middleware"]`.

```yaml
widget:
  type: traefik
  url: http://traefik.host.or.ip
  username: username # optional
  password: password # optional
```
