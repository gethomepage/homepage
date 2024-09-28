---
title: Resources
description: Resources Information Widget Configuration
---

You can include all or some of the available resources. If you do not want to see that resource, simply pass `false`.

The disk path is the path reported by `df` (Mounted On), or the mount point of the disk.

The cpu and memory resource information are the container's usage while [glances](glances.md) displays statistics for the host machine on which it is installed.

The resources widget primarily relies on a popular tool called [systeminformation](https://systeminformation.io). Thus, any limitiations of that software apply, for example, BRTFS RAID is not supported for the disk usage. In this case users may want to use the [glances widget](glances.md) instead.

_Note: unfortunately, the package used for getting CPU temp ([systeminformation](https://systeminformation.io)) is not compatible with some setups and will not report any value(s) for CPU temp._

**Any disk you wish to access must be mounted to your container as a volume.**

```yaml
- resources:
    cpu: true
    memory: true
    disk: /disk/mount/path
    cputemp: true
    tempmin: 0 # optional, minimum cpu temp
    tempmax: 100 # optional, maximum cpu temp
    uptime: true
    units: imperial # only used by cpu temp
    refresh: 3000 # optional, in ms
    diskUnits: bytes # optional, bytes (default) or bbytes. Only applies to disk
```

You can also pass a `label` option, which allows you to group resources under named sections,

```yaml
- resources:
    label: System
    cpu: true
    memory: true

- resources:
    label: Storage
    disk: /mnt/storage
```

Which produces something like this,

<img width="373" alt="Resource Groups" src="https://user-images.githubusercontent.com/82196/189524699-e9005138-e049-4a9c-8833-ac06e39882da.png">

If you have more than a single disk and would like to group them together under the same label, you can pass an array of paths instead,

```yaml
- resources:
    label: Storage
    disk:
      - /mnt/storage
      - /mnt/backup
      - /mnt/media
```

To produce something like this,

<img width="369" alt="Screenshot 2022-09-11 at 2 15 42 PM" src="https://user-images.githubusercontent.com/82196/189524583-abdf4cc6-99da-430c-b316-16c567db5639.png">

You can additionally supply an optional `expanded` property set to true in order to show additional details about the resources. By default the expanded property is set to false when not supplied.

```yaml
- resources:
    label: Array Disks
    expanded: true
    disk:
      - /disk1
      - /disk2
      - /disk3
```

![194136533-c4238c82-4d67-41a4-b3c8-18bf26d33ac2](https://user-images.githubusercontent.com/3441425/194728642-a9885274-922b-4027-acf5-a746f58fdfce.png)
