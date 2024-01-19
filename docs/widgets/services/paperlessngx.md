---
title: Paperless-ngx
description: Paperless-ngx Widget Configuration
---

[Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) - A community-supported supercharged version of paperless: scan, index and archive all your physical documents

Use username & password, or the token key. Information about the token can be found in the [Paperless-ngx API documentation](https://docs.paperless-ngx.com/api/#authorization). If both are provided, the token will be used.

Allowed fields: `["total", "inbox"]`.

```yaml
widget:
  type: paperlessngx
  url: http://paperlessngx.host.or.ip:port
  username: username
  password: password
```

```yaml
widget:
  type: paperlessngx
  url: http://paperlessngx.host.or.ip:port
  key: token
```
