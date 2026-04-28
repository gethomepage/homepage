---
title: Watchtower
description: Watchtower Widget Configuration
---

Learn more about [Watchtower](https://github.com/nicholas-fedor/watchtower).

To use this widget, Watchtower needs to be configured to [enable metrics](https://watchtower.nickfedor.com/dev/advanced-features/metrics-api/).

Allowed fields: `["containers_scanned", "containers_updated", "containers_failed"]`.

```yaml
widget:
  type: watchtower
  url: http://your-ip-address:8080
  key: demotoken
```
