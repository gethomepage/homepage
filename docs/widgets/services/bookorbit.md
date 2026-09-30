---
title: BookOrbit
description: BookOrbit Widget Configuration
---

Learn more about [BookOrbit](https://github.com/bookorbit/bookorbit).

```yaml
widget:
  type: bookorbit
  url: http://bookorbit.host.or.ip:3000
  username: username
  password: password
  fields: ["books", "authors", "reading", "finished"] # optional
```

## Fields

Allowed fields: `["books", "authors", "series", "storage", "reading", "finished"]` (maximum of 4).

Default fields: `["books", "authors", "reading", "finished"]`.
