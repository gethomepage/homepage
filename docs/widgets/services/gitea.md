---
title: Gitea
description: Gitea Widget Configuration
---

Learn more about [Gitea](https://gitea.com).

API tokens can be generated on the `User Settings` -> `Applications` page and require `notifications` and `repository` permissions.

There is currently a limit (20) to how many issues are received in the API call, but this can be increased by adding the following in the Gitea app.ini file.

```ini
[ui]
ISSUE_PAGING_NUM = 99
```

Allowed fields: ["notifications", "issues", "pulls"]

```yaml
widget:
  type: gitea
  url: http://gitea.host.or.ip:port
  key: giteaapitoken
```
