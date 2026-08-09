---
title: Proxmox
description: Proxmox Information Widget Configuration
---

_(Find the Proxmox service widget [here](../services/proxmox.md))_

The Proxmox widget shows the running/total count of QEMU VMs and LXC containers, plus the aggregated CPU and memory usage across your Proxmox cluster (or a single node).

See the [Proxmox configuration documentation](../../configs/proxmox.md#create-token) for details on creating API tokens.

Use `username@pam!Token ID` as the `username` (e.g `api@pam!homepage`) setting and `Secret` as the `password` setting.

```yaml
- proxmox:
    url: https://proxmox.host.or.ip:8006
    username: api_token_id
    password: api_token_secret
    node: pve-1 # optional, defaults to aggregating all online nodes
    label: My Cluster # optional, overrides the node/cluster name shown in the header
    vms: true # optional, enabled by default, disable by setting to false
    lxc: true # optional, enabled by default, disable by setting to false
    cpu: true # optional, enabled by default, disable by setting to false
    mem: true # optional, enabled by default, disable by setting to false
```

The widget header shows `label` if set, otherwise the `node` name, otherwise "Proxmox" — useful for telling multiple instances apart when you add one widget per node.

Use `vms`, `lxc`, `cpu` and `mem` to hide individual stats, e.g. to only show CPU and memory usage:

```yaml
- proxmox:
    url: https://proxmox.host.or.ip:8006
    username: api_token_id
    password: api_token_secret
    vms: false
    lxc: false
```
