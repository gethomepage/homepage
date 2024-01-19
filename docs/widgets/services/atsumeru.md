---
title: Atsumeru
description: Atsumeru Widget Configuration
---

[Atsumeru](https://github.com/AtsumeruDev/Atsumeru) - Free self-hosted mangas/comics/light novels media server

Define same username and password that is used for login from web or supported apps

Allowed fields: `["series", "archives", "chapters", "categories"]`.

```yaml
widget:
  type: atsumeru
  url: http://atsumeru.host.or.ip:port
  username: username
  password: password
```
