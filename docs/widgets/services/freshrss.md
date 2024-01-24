---
title: FreshRSS
description: FreshRSS Widget Configuration
---

Learn more about [FreshRSS](https://github.com/FreshRSS/FreshRSS).

Please refer to [Enable the API in FreshRSS](https://freshrss.github.io/FreshRSS/en/users/06_Mobile_access.html#enable-the-api-in-freshrss) for the "API password" to be entered in the password field.

Allowed fields: `["subscriptions", "unread"]`.

```yaml
widget:
  type: freshrss
  url: http://freshrss.host.or.ip:port
  username: username
  password: password
```
