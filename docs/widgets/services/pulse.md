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
  fields: ["nodes", "vms", "lxcs"] # optional
```
