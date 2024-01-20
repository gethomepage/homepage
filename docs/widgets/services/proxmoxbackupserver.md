---
title: Proxmox Backup Server
description: Proxmox Backup Server Widget Configuration
---

[Proxmox Backup Server](https://www.proxmox.com/en/proxmox-backup-server/overview) - Proxmox Backup Server is an enterprise backup solution, for backing up and restoring VMs, containers, and physical hosts.

Allowed fields: `["datastore_usage", "failed_tasks_24h", "cpu_usage", "memory_usage"]`.

```yaml
widget:
  type: proxmoxbackupserver
  url: https://proxmoxbackupserver.host:port
  username: api_token_id
  password: api_token_secret
```
