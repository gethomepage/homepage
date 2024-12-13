---
title: Gluetun
description: Gluetun Widget Configuration
---

Learn more about [Gluetun](https://github.com/qdm12/gluetun).

!!! note

    Requires [HTTP control server options](https://github.com/qdm12/gluetun-wiki/blob/main/setup/advanced/control-server.md) to be enabled. By default this runs on port `8000`.

Allowed fields: `["public_ip", "region", "country"]`.

To setup authentication, follow [the official Gluetun documentation](https://github.com/qdm12/gluetun-wiki/blob/main/setup/advanced/control-server.md#authentication).

```yaml
widget:
  type: gluetun
  url: http://gluetun.host.or.ip:port
  key: gluetunkey # Not required if /v1/publicip/ip endpoint is configured with `auth = none`
```
