---
title: Proxmox
description: Proxmox Configuration
---

The Proxmox connection is configured in the `proxmox.yaml` file. See [Create token](#create-token) section below for details on how to generate the required API token.

```yaml
url: https://proxmox.host.or.ip:8006
token: username@pam!Token ID
secret: secret
```

## Services

Once the Proxmox connection is configured, individual services can be configured to pull statistics of VMs or LXCs. Only CPU and Memory are currently supported.

### Configuration Options

- `proxmoxNode`: The name of the Proxmox node where your VM/LXC is running
- `proxmoxVMID`: The ID of the Proxmox VM or LXC container
- `proxmoxType`: (Optional) The type of Proxmox virtual machine. Defaults to `qemu` for VMs, but can be set to `lxc` for LXC containers

#### Examples

For a QEMU VM (default):

```yaml
- HomeAssistant:
  icon: home-assistant.png
  href: http://homeassistant.local/
  description: Home automation
  proxmoxNode: pve
  proxmoxVMID: 101
  # proxmoxType: qemu # This is the default, so it can be omitted
```

For an LXC container:

```yaml
- Nginx:
  icon: nginx.png
  href: http://nginx.local/
  description: Web server
  proxmoxNode: pve
  proxmoxVMID: 200
  proxmoxType: lxc
```

## Create token

You will need to generate an API Token for new or an existing user. Here is an example of how to do this for a new user.

1.  Navigate to the Proxmox portal, click on Datacenter
2.  Expand Permissions, click on Groups
3.  Click the Create button
4.  Name the group something informative, like api-ro-users
5.  Click on the Permissions "folder"
6.  Click Add -> Group Permission
    - Path: /
    - Group: group from bullet 4 above
    - Role: PVEAuditor
    - Propagate: Checked
7.  Expand Permissions, click on Users
8.  Click the Add button
    - User name: something informative like `api`
    - Realm: Linux PAM standard authentication
    - Group: group from bullet 4 above
9.  Expand Permissions, click on API Tokens
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
