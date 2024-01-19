---
title: GameDig
description: GameDig Widget Configuration
---

[GameDig](https://github.com/gamedig/node-gamedig) - GameDig is a game server query library, capable of querying for the status of nearly any game or voice server. If a server makes its status publically available, GameDig can fetch it for you.

Uses the [GameDig](https://www.npmjs.com/package/gamedig) library to get game server information for any supported server type.

Allowed fields (limited to a max of 4): `["status", "name", "map", "currentPlayers", "players", "maxPlayers", "bots", "ping"]`.

```yaml
widget:
  type: gamedig
  serverType: csgo # see https://github.com/gamedig/node-gamedig#games-list
  url: udp://server.host.or.ip:port
```
