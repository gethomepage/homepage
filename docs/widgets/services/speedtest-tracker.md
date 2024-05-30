---
title: Speedtest Tracker
description: Speedtest Tracker Widget Configuration
---

Learn more about [Speedtest Tracker](https://github.com/alexjustesen/speedtest-tracker). or
[Speedtest Tracker](https://github.com/henrywhitaker3/Speedtest-Tracker)

No extra configuration is required.

This widget is compatible with both [alexjustesen/speedtest-tracker](https://github.com/alexjustesen/speedtest-tracker) and [henrywhitaker3/Speedtest-Tracker](https://github.com/henrywhitaker3/Speedtest-Tracker).

Allowed fields: `["download", "upload", "ping"]`.

```yaml
widget:
  type: speedtest
  url: http://speedtest.host.or.ip
  bitratePrecision: 3 # optional, default is 0
```
