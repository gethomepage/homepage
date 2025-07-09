---
title: Proxmox Backup Server
description: Proxmox Backup Server Widget Configuration
---

Learn more about [Proxmox Backup Server](https://www.proxmox.com/en/proxmox-backup-server/overview).

You will need to generate an API Token for a new or existing user. Here is an example of how to do this for a new user called `api`.

Navigate to the Proxmox Backup Server web UI. Go to _Configuration_ > _Access Control_.
1. _User Management_ > Add
   - Username: `api`
   - Password: _\<Generate complex random password. No need to memorize it.\>_

2. _API Token_ > Add
   - User: _api@pbs_
   - Token Name: `homepage`

   Copy **Token ID** (_api@pbs!homepage_) and paste it as _username_.
   
   Copy **Secret** and paste it as _password_.

3. _Permissions_ > Add
   1. User Permission
      - Path: _/_
      - User: _api@pbs_
      - Role: _Audit_
   2. API Token Permission      
      - Path: _/_
      - User: _api@pbs!homepage_
      - Role: _Audit_

Allowed fields: `["datastore_usage", "failed_tasks_24h", "cpu_usage", "memory_usage"]`.

```yaml
widget:
  type: proxmoxbackupserver
  url: https://proxmoxbackupserver.host:port
  username: api_token_id
  password: api_token_secret
  datastore: datastore_name #optional; if ommitted, will display a combination of all datastores used / total
```
