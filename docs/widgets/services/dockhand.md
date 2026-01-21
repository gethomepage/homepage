---
title: Dockhand
description: Dockhand Widget Configuration
---

Learn more about [Dockhand](https://dockhand.pro/).

Provides useful information from your Dockhand.

Allowed fields: 
  - containersTotal
  - containersRunning
  - containersStopped
  - containersPaused
  - containersRestarting
  - containersUnhealthy
  - containersPendingUpdates
  - metricsCpuPercent
  - metricsMemoryPercent
  - metricsMemoryUsed
  - metricsMemoryTotal

Field example: `["containersRunning", "containersUnhealthy", "containersPendingUpdates"]`

```yaml
widget:
  type: dockhand
  url: http://dockhand.host.or.ip
  env: 1 # required
  # only required if authentication is enabled on Dockhand
  username: admin
  password: pass
```

## Env

The `env` is the **id of the environment** you want to use, here's how to get it:

- Response of `/api/environments`.
- After selecting the environment, get it from the Local Storage on key `dockhand:environment`.
