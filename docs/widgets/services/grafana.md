---
title: Grafana
description: Grafana Widget Configuration
---

Allowed fields: `["dashboards", "datasources", "totalalerts", "alertstriggered", "alertmanager"]`.

`alertmanager` is for the new grafana alerts api since the api used by `alertstriggered` has been deprecated. If `alertstriggered` does not work, try `alertmanager`.

```yaml
widget:
  type: grafana
  url: http://grafana.host.or.ip:port
  username: username
  password: password
```
