---
title: Glances
description: Glances Information Widget Configuration
---

_(Find the Glances service widget [here](../services/glances.md))_

The Glances widget allows you to monitor the resources (CPU, memory, storage, temp & uptime) of host or another machine, and is designed to match the `resources` info widget. You can have multiple instances by adding another configuration block. The `cputemp`, `uptime` & `disk` states require separate API calls and thus are not enabled by default. Glances needs to be running in "web server" mode to enable the API, see the [glances docs](https://glances.readthedocs.io/en/latest/quickstart.html#web-server-mode).

```yaml
- glances:
    url: http://host.or.ip:port
    username: user # optional if auth enabled in Glances
    password: pass # optional if auth enabled in Glances
    cpu: true # optional, enabled by default, disable by setting to false
    mem: true # optional, enabled by default, disable by setting to false
    cputemp: true # disabled by default
    uptime: true # disabled by default
    disk: / # disabled by default, use mount point of disk(s) in glances. Can also be a list (see below)
    diskUnits: bytes # optional, bytes (default) or bbytes. Only applies to disk
    expanded: true # show the expanded view
    label: MyMachine # optional
```

Multiple disks can be specified as:

```yaml
disk:
  - /
  - /boot
  ...
```

_Added in v0.4.18, updated in v0.6.11, v0.6.21_
