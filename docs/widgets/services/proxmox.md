---
title: Proxmox
description: Proxmox Widget Configuration
---

Learn more about [Proxmox](https://www.proxmox.com/en/).

This widget shows the running and total counts of both QEMU VMs and LX Containers in the Proxmox cluster. It also shows the CPU and memory usage of the first node in the cluster.

You will need to generate an API Token for new or an existing user. Here is an example of how to do this for a new user.

1. Navigate to the Proxmox portal, click on Datacenter
2. Expand Permissions, click on Groups
3. Click the Create button
4. Name the group something informative, like api-ro-users
5. Click on the Permissions "folder"
6. Click Add -> Group Permission
   - Path: /
   - Group: group from bullet 4 above
   - Role: PVEAuditor
   - Propagate: Checked
7. Expand Permissions, click on Users
8. Click the Add button
   - User name: something informative like `api`
   - Realm: Linux PAM standard authentication
   - Group: group from bullet 4 above
9. Expand Permissions, click on API Tokens
10. Click the Add button
    - User: user from bullet 8 above
    - Token ID: something informative like the application or purpose like `homepage`
    - Privilege Separation: Checked
11. Go back to the "Permissions" menu
12. Click Add -> API Token Permission
    - Path: /
    - API Token: select the Token ID created in Step 10
    - Role: PVE Auditor
    - Propagate: Checked

Use `username@pam!Token ID` as the `username` (e.g `api@pam!homepage`) setting and `Secret` as the `password` setting.

Allowed fields: `["vms", "lxc", "resources.cpu", "resources.mem"]`.

You can set the optional `node` setting when you want to show metrics for a single node. By default it will show the average for the complete cluster.

```yaml
widget:
  type: proxmox
  url: https://proxmox.host.or.ip:8006
  username: api_token_id
  password: api_token_secret
  node: pve-1 # optional
```
