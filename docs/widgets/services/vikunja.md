---
title: Vikunja
description: Vikunja Widget Configuration
---

Learn more about [Vikunja](https://vikunja.io).

Allowed fields: `["projects", "tasks", "overdue", "inprogress"]`.

"Projects" lists the number of non-archived Projects the user has access to.

"Tasks" lists the number of tasks due within the next 7 days.

"Overdue" lists the number of all tasks overdue.

"In Progress" lists the number of tasks with a progress percentage above 0% and below 100%.

```yaml
widget:
  type: vikunja
  url: http[s]://vikunja.host.or.ip[:port]
  key: vikunjaapikey
```
