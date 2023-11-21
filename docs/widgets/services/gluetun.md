---
title: Gluetun
description: Gluetun Widget Configuration
---

!!! note
    Requires [HTTP control server options](https://github.com/qdm12/gluetun-wiki/blob/main/setup/advanced/control-server.md) to be enabled. By default this runs on port `8000`.

Allowed fields: `["public_ip", "region", "country"]`.

```yaml
widget:
  type: gluetun
  # Default port for HTTP control server. If you have changed 
  # Gluetun's HTTP control server port, you will need to change
  # the port here to match.
  url: http://gluetun.host.or.ip:8000
```
