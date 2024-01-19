---
title: Gluetun
description: Gluetun Widget Configuration
---

[Glueton](https://github.com/qdm12/gluetun) - VPN client in a thin Docker container for multiple VPN providers, written in Go, and using OpenVPN or Wireguard, DNS over TLS, with a few proxy servers built-in.

!!! note

    Requires [HTTP control server options](https://github.com/qdm12/gluetun-wiki/blob/main/setup/advanced/control-server.md) to be enabled. By default this runs on port `8000`.

Allowed fields: `["public_ip", "region", "country"]`.

```yaml
widget:
  type: gluetun
  url: http://gluetun.host.or.ip:port
```
