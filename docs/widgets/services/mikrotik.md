---
title: Mikrotik
description: Mikrotik Widget Configuration
---

HTTPS may be required, [per the documentation](https://help.mikrotik.com/docs/display/ROS/REST+API#RESTAPI-Overview)

Allowed fields: `["uptime", "version", "cpuLoad", "memoryUsed", "numberOfLeases", "cpuTemperature", "sfpTemperature"]`.

```yaml
widget:
  type: mikrotik
  url: https://mikrotik.host.or.ip
  username: username
  password: password
```
