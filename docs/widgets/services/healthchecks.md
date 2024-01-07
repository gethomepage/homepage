---
title: Health checks
description: Health checks Widget Configuration
---

To use the Health Checks widget, you first need to generate an API key.

1. In your project, go to project Settings on the navigation bar.
2. Click on API key (read-only) and then click _Create_.
3. Copy the API key that is generated for you.

```yaml
widget:
  type: healthchecks
  url: http://healthchecks.host.or.ip:port
  key: <YOUR_API_KEY>
  uuid: <YOUR_CHECK_UUID> # optional, if not present group statistics is shown
```
