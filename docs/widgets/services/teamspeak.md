---
title: TeamSpeak
description: TeamSpeak Widget Configuration
---

Learn more about [TeamSpeak](https://www.teamspeak.com).

Use TeamSpeak's Query HTTP port, with apikey, to display information about your server.
The Query HTTP port has to be enabled in the TeamSpeak server
configuration [version 6](https://github.com/teamspeak/teamspeak6-server/blob/main/CONFIG.md) [version
3](https://github.com/xiaofeiTM233/teamspeak3-server/blob/main/doc/server_quickstart.md#configuration)
apikey is shown in the logs on first startup

Allowed fields: `["name", "activeusers", "status", "uptime"]`.

```yaml
widget:
  type: teamspeak
  url: http://teamspeak.host.or.ip:port
  key: token
```
