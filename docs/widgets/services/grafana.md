---
title: Grafana
description: Grafana Widget Configuration
---

[Grafana](https://github.com/grafana/grafana) - The open and composable observability and data visualization platform. Visualize metrics, logs, and traces from multiple sources like Prometheus, Loki, Elasticsearch, InfluxDB, Postgres and many more.

Allowed fields: `["dashboards", "datasources", "totalalerts", "alertstriggered"]`.

```yaml
widget:
  type: grafana
  url: http://grafana.host.or.ip:port
  username: username
  password: password
```
