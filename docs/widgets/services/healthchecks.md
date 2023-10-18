---
title: Health checks
description: Health checks Widget Configuration
---

To use the Health Checks widget, you first need to generate an API key. To do this, follow these steps:

1. Go to Settings in your check dashboard.
2. Click on API key (read-only) and then click _Create_.
3. Copy the API key that is generated for you.

Allowed fields: `["status", "last_ping"]`.

```yaml
widget:
  type: healthchecks
  url: http://healthchecks.host.or.ip:port
  key: <YOUR_API_KEY>
  uuid: <YOUR_CHECK_UUID>
```
