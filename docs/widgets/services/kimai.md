---
title: Kimai
description: Kimai Widget Configuration
---

Learn more about [Kimai](https://www.kimai.org/).

Generate an API token under `My Profile > API Access > Create new API token`. The token inherits the permissions of the user that owns it, so the widget reports that user's timesheet totals.

Allowed fields: `["active", "today", "week"]`.

- `active`: the currently running timer, shown as the project or activity name with elapsed time, or an idle label when no timer is running.
- `today`: total tracked time since midnight.
- `week`: total tracked time since the start of the current week (Monday).

```yaml
widget:
  type: kimai
  url: https://kimai.host.or.ip
  key: kimai-api-token
```
