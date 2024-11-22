---
title: Gitlab
description: Gitlab Widget Configuration
---

Learn more about [Gitlab](https://gitlab.com).

API requires a personal access token with either `read_api` or `api` permission. See the [gitlab documentation](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#create-a-personal-access-token) for details on generating one.

Allowed fields: `["events", "openIssues", "openMergeRequests"]`.

```yaml
widget:
  type: gitlab
  url: http://gitlab.host.or.ip:port
  key: personal-access-token
```
