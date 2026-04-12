---
title: Adguard Home
description: Adguard Home Widget Configuration
---

Learn more about [Adguard Home](https://github.com/AdguardTeam/AdGuardHome).

The username and password are the same as used to login to the web interface.

Allowed fields: `["queries", "blocked", "filtered", "latency"]`.
Optional fields: `abbreviate: true` (Shortens counts and rounds latency).

```yaml
widget:
  type: adguard
  url: http://adguard.host.or.ip
  username: admin
  password: password
  abbreviate: true
```
