---
title: Shelfmark
description: Shelfmark Widget Configuration
---

Learn more about [Shelfmark](https://github.com/calibrain/shelfmark).

Authenticates against `{url}/api/auth/login` with `username` and `password`, then reads `{url}/api/status`.

The widget displays item counts per status key from `/api/status`.
Default fields are `requested`, `downloading`, `complete`, and `error`.

```yaml
widget:
  type: shelfmark
  url: https://shelfmark.example.com
  username: username
  password: password
  # optional, max 4 fields:
  # fields: ["requested", "available", "cancelled", "complete", "done", "downloading", "error", "locating", "queued", "resolving"]
```
