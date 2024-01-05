---
title: Proxmox Backup Server
description: Proxmox Backup Server Widget Configuration
---


You will need to generate an API Token for new or an existing user. Here is an example of how to do this for a new user.

1. Navigate to the Proxmox Backup portal, click on Access Control
2. On the User Management tab, click the Add button
   - User name: api-ro-user (or something informative)
   - Realm: Proxmox Backup authentication
   - Password: your choosing
3. Go to API Token tab and click on the Add button
4. Select the previously created user.
5. Set the name to something informative, like api-homepage
6. Go to Permissions tab and click on Add > User Permission
   - Path: /
   - User: user from bullet 2 above
   - Role: Audit
   - Propagated: checked
7. Click again on Add > Api Token Permission
   - Path: /
   - User: token from bullet 5 above
   - Role: Audit
   - Propagated: checked

Use `username@pbs!Token ID` as the `username` (e.g `api-ro-user@pbs!api-homepage`) setting and `token` as the `password` setting.

Allowed fields: `["datastore_usage", "failed_tasks_24h", "cpu_usage", "memory_usage"]`.

```yaml
widget:
  type: proxmoxbackupserver
  url: https://proxmoxbackupserver.host:port
  username: api_token_id
  password: api_token_secret
```
