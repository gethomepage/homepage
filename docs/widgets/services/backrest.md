---
title: Backrest
description: Backrest Widget Configuration
---

[Backrest](https://garethgeorge.github.io/backrest/) is a web-based frontend for
the [Restic](https://restic.net/) backup tool.

**Allowed fields:** `["num_success_latest","num_failure_latest","num_success_30","num_plans","num_failure_30","bytes_added_30"]`

```yaml
widget:
  type: backrest
  url: http://backrest.host.or.ip
  username: admin # optional if auth is enabled in Backrest
  password: admin # optional if auth is enabled in Backrest
```
