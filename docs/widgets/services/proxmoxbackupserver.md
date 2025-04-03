---
title: Proxmox Backup Server
description: Proxmox Backup Server Widget Configuration
---

Create a user and an API-Token similar to the Proxmox VE description. You don't need the group though (not present at backup server).
It's important to give both the user and the token the role "Audit" when adding the rights. The role "DatastoreAudit" won't work.

Learn more about [Proxmox Backup Server](https://www.proxmox.com/en/proxmox-backup-server/overview).

Allowed fields: `["datastore_usage", "failed_tasks_24h", "cpu_usage", "memory_usage"]`.

```yaml
widget:
  type: proxmoxbackupserver
  url: https://proxmoxbackupserver.host:port
  username: api_token_id
  password: api_token_secret
```
