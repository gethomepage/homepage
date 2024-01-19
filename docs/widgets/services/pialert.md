---
title: PiAlert
description: PiAlert Widget Configuration
---

[PiAlert](https://github.com/pucherot/Pi.Alert) - WIFI / LAN intruder detector. Check the devices connected and alert you with unknown devices. It also warns of the disconnection of "always connected" devices.

Widget for [PiAlert](https://github.com/jokob-sk/Pi.Alert).

Allowed fields: `["total", "connected", "new_devices", "down_alerts"]`.

```yaml
widget:
  type: pialert
  url: http://ip:port
```
