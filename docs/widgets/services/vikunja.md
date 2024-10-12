---
title: Vikunja
description: Vikunja Widget Configuration
---

Learn more about [Vikunja](https://vikunja.io).

Allowed fields: `["projects", "tasks7d", "tasksOverdue", "tasksInProgress"]`.

A list of the next 5 tasks ordered by due date is disabled by default, but can be enabled with the `enableTaskList` option.

```yaml
widget:
  type: vikunja
  url: http[s]://vikunja.host.or.ip[:port]
  key: vikunjaapikey
  enableTaskList: true # optional, defaults to false
```
