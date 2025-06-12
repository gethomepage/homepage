---
title: Checkmk
description: Checkmk Widget Configuration
---

Learn more about [Checkmk](https://github.com/Checkmk/checkmk).

To setup authentication, follow the official [Checkmk API](https://docs.checkmk.com/latest/en/rest_api.html?lquery=api#bearerauth) documentation.

```yaml
widget:
  type: checkmk
  url: http://checkmk.host.or.ip:port
  site: your-site-name-cla-by-default
  username: username
  password: password
```
