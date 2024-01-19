---
title: Moonraker (Klipper)
description: Moonraker (Klipper) Widget Configuration
---

[Moonraker](https://github.com/Arksine/moonraker) - Web API Server for Klipper

Allowed fields: `["printer_state", "print_status", "print_progress", "layers"]`.

```yaml
widget:
  type: moonraker
  url: http://moonraker.host.or.ip:port
```
