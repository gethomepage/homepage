---
title: Jackett
description: Jackett Widget Configuration
---

Learn more about [Jackett](https://github.com/Jackett/Jackett).

If Jackett has an admin password set, you must set the `password` field for the widget to work.

Allowed fields: `["configured", "errored"]`.

```yaml
widget:
  type: jackett
  url: http://jackett.host.or.ip
  password: jackettadminpassword # optional
```
