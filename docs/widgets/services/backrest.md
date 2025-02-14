---
title: Backrest
description: Backrest Widget Configuration
---

[Backrest](https://garethgeorge.github.io/backrest/) is a web-based frontend for
the [Restic](https://restic.net/) backup tool.

The widget shows:
  - The number of configured plans;
  - The number of successful backups in the last 30 days;
  - The number of failed backups in the last 30 days; and
  - The amount of data added to backups in the last 30 days.

```yaml
widget:
  - type: backrest
    url: http://backrest.host.or.ip
    username: admin # optional if auth is enabled in Backrest
    password: admin # optional if auth is enabled in Backrest
```
