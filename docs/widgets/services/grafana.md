---
title: Grafana
description: Grafana Widget Configuration
---

Learn more about [Grafana](https://github.com/grafana/grafana).

| Grafana Version | Homepage Widget Version |
| --------------- | ----------------------- |
| <= v10.4        | 1 (default)             |
| > v10.4         | 2                       |

Allowed fields: `["dashboards", "datasources", "totalalerts", "alertstriggered"]`.

```yaml
widget:
  type: grafana
  version: 2 # optional, default is 1
  alerts: alertmanager # optional, default is grafana
  url: http://grafana.host.or.ip:port
  username: username
  password: password
```
