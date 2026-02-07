---
title: Proxmox
description: Proxmox Widget Configuration
---

Learn more about [Proxmox](https://www.proxmox.com/en/).

This widget shows the running and total counts of both QEMU VMs and LX Containers in the Proxmox cluster. It also shows the CPU and memory usage of the first node in the cluster.

See the [Proxmox configuration documentation](../../configs/proxmox.md#create-token) for details on creating API tokens.

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
