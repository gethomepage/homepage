---
title: Beszel
description: Beszel Widget Configuration
---

Learn more about [Beszel](https://github.com/henrygd/beszel)

The widget has two modes, a single system with detailed info if `systemId` is provided, or an overview of all systems if `systemId` is not provided.

The `systemID` is the `id` field on the collections page of Beszel under the PocketBase admin panel. You can also use the 'nice name' from the Beszel UI.

Allowed fields for 'overview' mode: `["systems", "up"]`
Allowed fields for a single system: `["name", "status", "updated", "cpu", "memory", "disk", "network"]`

| Beszel Version | Homepage Widget Version |
| -------------- | ----------------------- |
| < 0.9.0        | 1 (default)             |
| >= 0.9.0       | 2                       |

```yaml
widget:
  type: beszel
  url: http://beszel.host.or.ip
  username: username # email
  password: password
  systemId: systemId # optional
  version: 2 # optional, default is 1
```
