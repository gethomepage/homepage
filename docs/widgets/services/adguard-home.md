---
title: Adguard Home
description: Adguard Home Widget Configuration
---

[Adguard Home](https://github.com/AdguardTeam/AdGuardHome) - Network-wide ads & trackers blocking DNS server

The username and password are the same as used to login to the web interface.

Allowed fields: `["queries", "blocked", "filtered", "latency"]`.

```yaml
widget:
  type: adguard
  url: http://adguard.host.or.ip
  username: admin
  password: password
```
