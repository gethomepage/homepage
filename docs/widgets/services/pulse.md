---
title: Pulse
description: Pulse Widget Configuration
---

Learn more about [Pulse](https://github.com/rcourtman/Pulse).

Pulse is a real-time monitoring dashboard for Proxmox VE, Proxmox Backup Server, and Docker/host infrastructure.

An API token with the **Kiosk / Dashboard** scope is required. Generate one in Pulse under **Settings → Security → API Tokens**.

Allowed fields: `["nodes", "vms", "lxcs"]`

```yaml
widget:
  type: pulse
  url: http://pulse.host.or.ip:7655
  key: your-api-token
  fields: ["nodes", "vms", "lxcs"] # optional, defaults to all
```
