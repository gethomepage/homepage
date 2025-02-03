---
title: Speedtest Tracker
description: Speedtest Tracker Widget Configuration
---

Learn more about [Speedtest Tracker](https://github.com/alexjustesen/speedtest-tracker). or
[Speedtest Tracker](https://github.com/henrywhitaker3/Speedtest-Tracker)

No extra configuration is required.

Version 1 of the widget is compatible with both [alexjustesen/speedtest-tracker](https://github.com/alexjustesen/speedtest-tracker) and [henrywhitaker3/Speedtest-Tracker](https://github.com/henrywhitaker3/Speedtest-Tracker), while version 2 is only compatible with [alexjustesen/speedtest-tracker](https://github.com/alexjustesen/speedtest-tracker).

| Speedtest Version (AJ) | Speedtest Version (HW) | Homepage Widget Version |
| ---------------------- | ---------------------- | ----------------------- |
| < 1.2.1                | ≤ 1.12.0               | 1 (default)             |
| >= 1.2.1               | N/A                    | 2                       |

Allowed fields: `["download", "upload", "ping"]`.

```yaml
widget:
  type: speedtest
  url: http://speedtest.host.or.ip
  version: 1 # optional, default is 1
  key: speedtestapikey # required for version 2
  bitratePrecision: 3 # optional, default is 0
```
