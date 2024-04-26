---
title: Proxmox Backup Server
description: Proxmox Backup Server Widget Configuration
---

Learn more about [Proxmox Backup Server](https://www.proxmox.com/en/proxmox-backup-server/overview).

Open Access Control, API Token, Add.
  Select your user and give the token a recognizable name.
  Make sure to note this secret as it wont be shown again.
Open Permissions, Add API Token Permission.
  Path: /
  API Token: -as above-
  Role: Audit
  Propagate checked.
Edit widget settings where username is 'user@pam!tokenname' and password is the API token secret.
Your API access for the homepage widget should be functional now.

Allowed fields: `["datastore_usage", "failed_tasks_24h", "cpu_usage", "memory_usage"]`.

```yaml
widget:
  type: proxmoxbackupserver
  url: https://proxmoxbackupserver.host:port
  username: api_token_id
  password: api_token_secret
```
