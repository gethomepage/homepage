---
title: PeaNUT
description: PeaNUT Widget Configuration
---

The default ups name is `ups`. To configure more than one ups, you must create multiple peanut services.

Allowed fields: `["battery_charge", "ups_load", "ups_status"]`

```yaml
widget:
  type: peanut
  url: http://peanut.host.or.ip:port
  key: nameofyourups
```
