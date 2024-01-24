---
title: PiHole
description: PiHole Widget Configuration
---

Learn more about [PiHole](https://github.com/pi-hole/pi-hole).

As of v2022.12 [PiHole requires the use of an API key](https://pi-hole.net/blog/2022/11/17/upcoming-changes-authentication-for-more-api-endpoints-required/#page-content) if an admin password is set. Older versions do not require any authentication even if the admin uses a password.

Allowed fields: `["queries", "blocked", "blocked_percent", "gravity"]`.

```yaml
widget:
  type: pihole
  url: http://pi.hole.or.ip
  key: yourpiholeapikey # optional
```

_Added in v0.1.0, updated in v0.6.18_
