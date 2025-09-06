---
title: Mousehole
description: Mousehole Widget Configuration
---

Learn more about [Mousehole](https://github.com/t-mart/mousehole).

Mousehole is a background service that updates seedbox IP addresses for MAM (MyAnonaMouse) and provides status information through an API.

Allowed fields: `["status", "ip_address", "last_check", "next_check"]`.

```yaml
widget:
  type: mousehole
  url: http://localhost:5010
  fields: # optional, defaults to all fields
    - status
    - ip_address
    - last_check
    - next_check
```
