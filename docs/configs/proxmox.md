---
title: Proxmox
description: Proxmox Configuration
---

The Proxmox connection is configured in the `proxmox.yaml` file.

```yaml
url: https://proxmox.host.or.ip:8006
username: api_token_id
password: api_token_secret
```

## Services

Once the Proxmox connection is configured, individual services can be configured to pull statistics of VMs or LXCs. Only CPU and Memory are currently supported.

### Configuration Options

- `proxmox_node`: The name of the Proxmox node where your VM/LXC is running
- `proxmox_vmid`: The ID of the Proxmox VM or LXC container
- `proxmox_type`: (Optional) The type of Proxmox virtual machine. Defaults to `qemu` for VMs, but can be set to `lxc` for LXC containers

#### Examples

For a QEMU VM (default):
```yaml
- HomeAssistant:
  icon: home-assistant.png
  href: "http://homeassistant.local/"
  description: Home automation
  proxmox_node: pve
  proxmox_vmid: 101
  # proxmox_type: qemu # This is the default, so it can be omitted
```

For an LXC container:
```yaml
- Nginx:
  icon: nginx.png
  href: "http://nginx.local/"
  description: Web server
  proxmox_node: pve
  proxmox_vmid: 200
  proxmox_type: lxc
```
