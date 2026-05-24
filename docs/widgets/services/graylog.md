---
title: Graylog
description: Graylog Widget Configuration
---

Learn more about [Graylog](https://github.com/Graylog2/graylog2-server).

Shows three metrics for a Graylog instance: ingested message count over a configurable time window, current input throughput, and the number of active system notifications.

```yaml
widget:
  type: graylog
  url: http://graylog.host.or.ip:port
  username: admin
  password: password
  range: 86400 # optional, in seconds, default 86400 (24h)
```
