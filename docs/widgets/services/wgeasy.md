---
title: Wg-Easy
description: Wg-Easy Widget Configuration
---

Learn more about [Wg-Easy](https://github.com/wg-easy/wg-easy).

Allowed fields: `["connected", "enabled", "disabled", "total"]`.

Note: by default `["connected", "enabled", "total"]` are displayed.

To detect if a device is connected the time since the last handshake is queried. `threshold` is the time to wait in minutes since the last handshake to consider a device connected. Default is 2 minutes.

| Wg-Easy API Version | Homepage Widget Version |
| ------------------- | ----------------------- |
| < v15               | 1 (default)             |
| >= v15              | 2                       |

```yaml
widget:
  type: wgeasy
  url: http://wg.easy.or.ip
  version: 2 # optional, default is 1
  username: yourwgusername # required for v15 and above
  password: yourwgeasypassword
  threshold: 2 # optional
```
