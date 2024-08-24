---
title: Romm
description: Romm Widget Configuration
---

Allowed fields: `["platforms", "totalRoms", "saves", "states", "screenshots", "totalfilesize"]`.
If more than (4) fields are provided, only the first (4) will be used.

```yaml
widget:
  type: romm
  url: http://romm.host.or.ip
  username: username # optional
  password: password # optional
  fields: ["platforms", "totalRoms", "saves", "states"] # optional - default fields shown
```
