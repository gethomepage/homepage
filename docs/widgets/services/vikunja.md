---
title: Vikunja
description: Vikunja Widget Configuration
---

Learn more about [Vikunja](https://vikunja.io).

Allowed fields: `["projects", "tasks7d", "tasksOverdue", "tasksInProgress"]`.

"Projects" lists the number of non-archived Projects the user has access to.

"Tasks 7d" lists the number of tasks due within the next 7 days.

"Tasks Overdue" lists the number of all tasks overdue.

"Tasks In Progress" lists the number of tasks with a progress percentage above 0% and below 100%.

A list of the next 5 tasks ordered by due date is disabled by default, but can be enabled with the `enableTaskList` option.

```yaml
widget:
  type: vikunja
  url: http[s]://vikunja.host.or.ip[:port]
  key: vikunjaapikey
  enableTaskList: true # optional, defaults to false
```
