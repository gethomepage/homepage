---
title: Tandoor
description: Tandoor Widget Configuration
---

Generate a user API key under `Settings > API  > Generate`. For the token's scope, use `read`.

Allowed fields: `["users", "recipes", "keywords"]`.

```yaml
widget:
  type: tandoor
  url: http://tandoor-frontend.host.or.ip
  key: tandoor-api-token
```
