---
title: Vikunja
description: Vikunja Widget Configuration
---

Learn more about [Vikunja](https://vikunja.io).

Allowed fields: `["projects", "tasks"]`.

"Projects" lists the number of non-archived Projects the user has access to.

"Tasks" lists the number of tasks due within the next 7 days.

```yaml
widget:
  type: vikunja
  url: http[s]://vikunja.host.or.ip[:port]
  key: vikunjaapikey
```
