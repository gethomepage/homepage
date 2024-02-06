---
title: Navidrome
description: Navidrome Widget Configuration
---

Learn more about [Navidrome](https://github.com/navidrome/navidrome).

For detailed information about how to generate the token see http://www.subsonic.org/pages/api.jsp.

Allowed fields: no configurable fields for this widget.

```yaml
widget:
  type: navidrome
  url: http://navidrome.host.or.ip:port
  user: username
  token: token #md5(password + salt)
  salt: randomsalt
```
