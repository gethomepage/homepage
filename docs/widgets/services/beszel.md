---
title: Beszel
description: Beszel Widget Configuration
---

Learn more about [Beszel](https://github.com/henrygd/beszel)

The widget has two modes, a single system with detailed info if `systemId` is provided, or an overview of all systems if `systemId` is not provided.

The `systemID` is the `id` field on the collections page of Beszel under the PocketBase admin panel. You can also use the 'nice name' from the Beszel UI.

By default the widget authenticates as a PocketBase superuser (`collections/_superusers` for `version: 2`, or `admins` for `version: 1`).

Regular Beszel users (roles `user`, `admin`, or `readonly`) live in the `users` collection and can still read `systems` records, filtered to the systems they can access. To sign in as one of those users, set `authCollection` to `users`.

Allowed fields for 'overview' mode: `["systems", "up"]`
Allowed fields for a single system (max 4): `["name", "status", "updated", "cpu", "memory", "disk", "network", "temp", "load", "gpu", "uptime", "services", "updates", "battery", "agent"]`

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
  authCollection: users # optional, default is the superuser collection for the chosen version
```
