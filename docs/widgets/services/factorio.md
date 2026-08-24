---
title: Factorio
description: Factorio Widget Configuration
---

Learn more about [Factorio](https://www.factorio.com/).

Connects to the Factorio server's [RCON interface](https://wiki.factorio.com/Console#Remote_console) to show whether the server is online, the current player count, and playtime.

RCON must be enabled on the server (`--rcon-port` and `--rcon-password` server launch options, or the equivalent settings in `server-settings.json`).

```yaml
widget:
  type: factorio
  url: http://factorio.host.or.ip:rcon-port
  rcon-password: rconpassword
```
