---
title: Gitea
description: Gitea Widget Configuration
---

Learn more about [Gitea](https://gitea.com).

API token requires `notifications`, `repository` and `issue` permissions. See the [gitea documentation](https://docs.gitea.com/development/api-usage#generating-and-listing-api-tokens) for details on generating tokens.

Allowed fields: ["notifications", "issues", "pulls"]

```yaml
widget:
  type: gitea
  url: http://gitea.host.or.ip:port
  key: giteaapitoken
```
