---
title: Whats Up Docker
description: WhatsUpDocker Widget Configuration
---

[Whats Up Docker](https://github.com/fmartinou/whats-up-docker) - What's up Docker ( aka WUD ) gets you notified when a new version of your Docker Container is available.

Currently requires unauthenticated whatsupdocker instance.

Allowed fields: `["monitoring", "updates"]`.

```yaml
widget:
  type: whatsupdocker
  url: http://whatsupdocker:port
```
