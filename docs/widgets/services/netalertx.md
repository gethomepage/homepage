---
title: NetAlertX
description: NetAlertX (formerly PiAlert) Widget Configuration
---

Learn more about [NetAlertX](https://github.com/jokob-sk/NetAlertX).

_Note that the project was renamed from PiAlert to NetAlertX._

Allowed fields: `["total", "connected", "new_devices", "down_alerts"]`.

If you have enabled a password on your NetAlertX instance, you will need to provide the `SYNC_api_token` as the `key` in your config.

```yaml
widget:
  type: netalertx
  url: http://ip:port
  key: netalertxsyncapitoken # optional, only if password is enabled
```
