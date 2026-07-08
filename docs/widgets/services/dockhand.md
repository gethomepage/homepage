---
title: Dockhand
description: Dockhand Widget Configuration
---

Learn more about [Dockhand](https://dockhand.pro/).

Authenticate with either a Dockhand [API token](https://dockhand.pro/manual/#api-authentication) (recommended) or Dockhand's local username/password. A token is scoped to the user that created it and can be revoked without changing your password, so it's preferable to storing account credentials in your config. If both are provided, the token is used.

**Allowed fields:** (max 4): `running`, `stopped`, `paused`, `total`, `cpu`, `memory`, `images`, `volumes`, `events_today`, `pending_updates`, `stacks`.
**Default fields:** `running`, `total`, `cpu`, `memory`.

Using an API token:

```yaml
widget:
  type: dockhand
  url: http://localhost:3001
  environment: local # optional: name or id; aggregates all when omitted
  key: dockhandapitoken # generate under Settings in Dockhand
```

Using local authentication:

```yaml
widget:
  type: dockhand
  url: http://localhost:3001
  environment: local # optional: name or id; aggregates all when omitted
  username: your-user # required for local auth
  password: your-pass # required for local auth
```
