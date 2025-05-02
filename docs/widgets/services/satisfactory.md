---
title: Satisfactory Dedicated Server
description: Satisfactory Dedicated Server Widget Configuration
---

Allowed fields: `["session", "players", "state", "duration", "gamephase", "techtier", "milestone", "tickrate"]`.
If more than (4) fields are provided, only the first (4) will be used.

```yaml
widget:
  type: satisfactory
  url: https://server.host.or.ip:port # default server port is 7777
  key: # Obtained by issuing the command "server.GenerateAPIToken" in the Dedicated Server console.
  fields: ["session", "players", "state", "duration"] # optional - default fields shown
```
