---
title: Beszel
description: Beszel Widget Configuration
---

Learn more about [Beszel]()

The widget has two modes, a single system with detailed info if `systemId` is provided, or an overview of all systems if `systemId` is not provided.

Allowed fields for 'overview' mode: `["systems", "up"]`
Allowed fields for a single system: `["name", "status", "updated", "cpu", "memory", "disk", "network"]`

```yaml
widget:
  type: beszel
  url: http://beszel.host.or.ip
  username: username # email
  password: password
  systemId: systemId # optional
```
