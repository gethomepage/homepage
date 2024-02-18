---
title: Moonraker (Klipper)
description: Moonraker (Klipper) Widget Configuration
---

Learn more about [Moonraker](https://github.com/Arksine/moonraker).

Allowed fields: `["printer_state", "print_status", "print_progress", "layers"]`.

```yaml
widget:
  type: moonraker
  url: http://moonraker.host.or.ip:port
```

If your moonraker instance has an active authorization and your homepage ip isn't whitelisted you need to add your api key ([Authorization Documentation](https://moonraker.readthedocs.io/en/latest/web_api/#authorization)).

```yaml
widget:
  type: moonraker
  url: http://moonraker.host.or.ip:port
  key: api_keymoonraker
```
