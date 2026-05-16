---
title: Forgejo
description: Forgejo Widget Configuration
---

Learn more about [Forgejo](https://forgejo.org).

Forgejo is a self-hosted Git service and a fork of Gitea. Its API is compatible with Gitea's API.

API token requires `notifications`, `repository` and `issue` permissions. See the [Forgejo documentation](https://forgejo.org/docs/latest/user/api-usage/#generating-and-listing-api-tokens) for details on generating tokens.

Allowed fields: `["repositories", "notifications", "open_issues", "commits"]`.

```yaml
widget:
  type: forgejo
  url: http://forgejo.host.or.ip:port
  key: forgejoapitoken
```

## Optional fields

| Field | Type | Default | Description |
|---|---|---|---|
| `commit-cache` | number | `5` | Cache duration in minutes for the aggregated commit count. Set to `0` to disable caching. |
| `pagination` | boolean | `false` | When `true`, paginates through the repository list to collect all repos (useful when the token has access to 50+ repositories). |

```yaml
widget:
  type: forgejo
  url: http://forgejo.host.or.ip:port
  key: forgejoapitoken
  commit-cache: 15
  pagination: true
```
