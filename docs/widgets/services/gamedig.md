---
title: GameDig
description: GameDig Widget Configuration
---

Learn more about [GameDig](https://github.com/gamedig/node-gamedig).

Uses the [GameDig](https://www.npmjs.com/package/gamedig) library to get game server information for any supported server type.

Allowed fields (limited to a max of 4): `["status", "name", "map", "currentPlayers", "players", "maxPlayers", "bots", "ping"]`.

```yaml
widget:
  type: gamedig
  serverType: csgo # see https://github.com/gamedig/node-gamedig#games-list
  url: udp://server.host.or.ip:port
```
