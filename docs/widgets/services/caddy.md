---
title: Caddy
description: Caddy Widget Configuration
---

[Caddy](https://github.com/caddyserver/caddy) - Fast and extensible multi-platform HTTP/1-2-3 web server with automatic HTTPS

Allowed fields: `["upstreams", "requests", "requests_failed"]`.

```yaml
widget:
  type: caddy
  url: http://caddy.host.or.ip:adminport # default admin port is 2019
```
