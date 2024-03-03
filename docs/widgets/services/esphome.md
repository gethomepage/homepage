---
title: ESPHome
description: ESPHome Widget Configuration
---

Learn more about [ESPHome](https://esphome.io/).

Show the number of ESPHome devices based on their state.

Allowed fields: `["total", "online", "offline", "unknown"]`.

```yaml
widget:
  type: esphome
  url: http://esphome.host.or.ip:port
```
