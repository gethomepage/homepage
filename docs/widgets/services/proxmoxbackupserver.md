---
title: Proxmox Backup Server
description: Proxmox Backup Server Widget Configuration
---

Learn more about [Proxmox Backup Server](https://www.proxmox.com/en/proxmox-backup-server/overview).

Create a user and an API-Token similar to the [Proxmox VE description](proxmox.md). The "Audit" role is required for both the user and token (not group).

Allowed fields: `["datastore_usage", "failed_tasks_24h", "cpu_usage", "memory_usage"]`.

```yaml
widget:
  type: proxmoxbackupserver
  url: https://proxmoxbackupserver.host:port
  username: api_token_id
  password: api_token_secret
```
