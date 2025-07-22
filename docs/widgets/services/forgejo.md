---
title: Forgejo
description: Forgejo Widget Configuration
---

Learn more about [Forgejo](https://forgejo.org/).

API token requires `notifications`, `repository` and `issue` permissions. See the [Forgejo documentation](https://forgejo.org/docs/latest/user/api-usage/) for details on generating tokens.

Allowed fields: `["repositories", "notifications", "issues", "pulls"]`.

```yaml
widget:
  type: forgejo
  url: http://forgejo.host.or.ip:port
  key: forgejoapitoken
```
