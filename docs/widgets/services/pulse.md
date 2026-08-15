---
title: Pulse
description: Pulse Widget Configuration
---

Learn more about [Pulse](https://github.com/rcourtman/Pulse).

Allowed fields: `["nodes", "vms", "lxcs"]`.

```yaml
widget:
  type: pulse
  url: http://pulse.host.or.ip:7655
  key: your-api-token # `monitoring:read` scope is required
  version: 2 # required for Pulse v6, defaults to 1
  fields: ["nodes", "vms", "lxcs"] # optional
```
