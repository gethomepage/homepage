---
title: Mastodon
description: Mastodon Widget Configuration
---

Learn more about [Mastodon](https://github.com/mastodon/mastodon).

Use the base URL of the Mastodon instance you'd like to pull stats for. Does not require authentication as the stats are part of the public API endpoints.

Allowed fields: `["user_count", "status_count", "domain_count"]`.

```yaml
widget:
  type: mastodon
  url: https://mastodon.host.name
```
