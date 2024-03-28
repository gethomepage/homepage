---
title: ESPHome
description: ESPHome Widget Configuration
---

Learn more about [ESPHome](https://esphome.io/).

Show the number of ESPHome devices based on their state.

Allowed fields: `["total", "online", "offline", "offline_alt", "unknown"]` (maximum of 4).

By default ESPHome will only mark devices as `offline` if their address cannot be pinged. If it has an invalid config or its name cannot be resolved (by DNS) its status will be marked as `unknown`.
To group both `offline` and `unknown` devices together, users should use the `offline_alt` field instead. This sums all devices that are _not_ online together.

```yaml
widget:
  type: esphome
  url: http://esphome.host.or.ip:port
```
