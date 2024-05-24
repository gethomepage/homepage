---
title: Wg-Easy
description: Wg-Easy Widget Configuration
---

Learn more about [Wg-Easy](https://github.com/wg-easy/wg-easy).

Allowed fields: `["connected", "enabled", "disabled", "total"]`.

Note: by default `["connected", "enabled", "total"]` are displayed.

To detect if a device is connected the time since the last handshake is queried. `threshold` is the time to wait in minutes since the last handshake to consider a device connected. Default is 2 minutes.

```yaml
widget:
  type: wgeasy
  url: http://wg.easy.or.ip
  password: yourwgeasypassword
  threshold: 2 # optional
```
