---
title: Pocket ID
description: Pocket ID Widget Configuration
---

Learn more about [Pocket ID](https://github.com/pocket-id/pocket-id).

This widget reads the number of users and OIDC clients in the system.

You will need to generate an API key under `Administration` > `API keys`.

Allowed fields: `["users", "oidcClients"]`.

```yaml
widget:
  type: pocketid
  url: http://pocketid.host.or.ip:port
  key: your-api-key
```
