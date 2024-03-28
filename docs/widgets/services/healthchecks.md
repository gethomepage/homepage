---
title: Health checks
description: Health checks Widget Configuration
---

Learn more about [Health Checks](https://github.com/healthchecks/healthchecks).

Specify a single check by including the `uuid` field or show the total 'up' and 'down' for all
checks by leaving off the `uuid` field.

To use the Health Checks widget, you first need to generate an API key.

1. In your project, go to project Settings on the navigation bar.
2. Click on API key (read-only) and then click _Create_.
3. Copy the API key that is generated for you.

Allowed fields: `["status", "last_ping"]` for single checks, `["up", "down"]` for total stats.

```yaml
widget:
  type: healthchecks
  url: http://healthchecks.host.or.ip:port
  key: <YOUR_API_KEY>
  uuid: <CHECK_UUID> # optional, if not included total statistics for all checks is shown
```
