---
title: ArchiSteamFarm
description: ArchiSteamFarm Widget Configuration
---

Learn more about [ArchiSteamFarm](https://github.com/JustArchiNET/ArchiSteamFarm).

This widget uses the ASF IPC API and requires the configured IPC password.

Allowed fields: `["bots", "version", "memory", "uptime"]`

```yaml
widget:
  type: archisteamfarm
  url: https://asf.host.or.ip
  password: your_ipc_password
```
