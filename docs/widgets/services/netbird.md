---
title: NetBird
description: NetBird Widget Configuration
---

Learn more about [NetBird](https://netbird.io).

You will need a [personal access token](https://docs.netbird.io/manage/public-api) from an account with the `Admin` role, preferably a service user.

Allowed fields: `["online", "users", "login_expired"]`.

By default `online` and `users` are shown. `login_expired` (peers whose login has expired) is optional.

```yaml
widget:
  type: netbird
  url: https://netbird.host.or.ip
  key: netbirdpersonalaccesstoken
```
