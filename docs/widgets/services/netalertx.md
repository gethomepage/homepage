---
title: NetAlertX
description: NetAlertX (formerly PiAlert) Widget Configuration
---

Learn more about [NetAlertX](https://github.com/jokob-sk/NetAlertX).

_Note that the project was renamed from PiAlert to NetAlertX._

Allowed fields: `["total", "connected", "new_devices", "down_alerts"]`.

Provide the `API_TOKEN` (f.k.a. `SYNC_api_token`) as the `key` in your config.

| NetAlertX Version | Homepage Widget Version |
| ----------------- | ----------------------- |
| < v26.1.17        | 1 (default)             |
| > v26.1.17        | 2                       |

```yaml
widget:
  type: netalertx
  url: http://ip:port # use backend port for widget version 2+
  key: yournetalertxapitoken
  version: 2 # optional, default is 1
```
