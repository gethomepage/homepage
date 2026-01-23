---
title: Dockhand
description: Dockhand Widget Configuration
---

Learn more about [Dockhand](https://dockhand.pro/).

Note: The widget currently supports Dockhand's **local** authentication only.

```yaml
widget:
  type: dockhand
  url: http://localhost:3001
  environment: local # optional: name or id; aggregates all when omitted
  username: your-user # required for local auth
  password: your-pass # required for local auth
```
