---
title: BookOrbit
description: BookOrbit Widget Configuration
---

Learn more about [BookOrbit](https://github.com/bookorbit/bookorbit).

API key authentication requires BookOrbit 3.8.0 or later.

```yaml
widget:
  type: bookorbit
  url: http://bookorbit.host.or.ip:3000
  username: username # optional, if not using an API key
  password: password # optional, if not using an API key
  key: bookorbitapikey # optional, takes precedence over username/password
  fields: ["books", "authors", "reading", "finished"] # optional
```

## Fields

Allowed fields: `["books", "authors", "series", "storage", "reading", "finished"]` (maximum of 4).

Default fields: `["books", "authors", "reading", "finished"]`.
