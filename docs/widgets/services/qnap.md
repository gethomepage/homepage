---
title: QNAP
description: QNAP Widget Configuration
---

Learn more about [QNAP](https://www.qnap.com).

Allowed fields: `["cpuUsage", "memUsage", "systemTempC", "poolUsage", "volumeUsage"]`.

```yaml
widget:
  type: qnap
  url: http://qnap.host.or.ip:port
  username: user
  password: pass
```

If the QNAP device has multiple volumes, the _poolUsage_ will be a sum of all volumes.

If only a single volume needs to be tracked, add the following to your configuration and the Widget will track this as _volumeUsage_:

```yaml
volume: Volume Name From QNAP
```
