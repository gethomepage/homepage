---
title: FRITZ!Box
description: FRITZ!Box Widget Configuration
---

Application access & UPnP must be activated on your device:

```
Home Network > Network > Network Settings > Access Settings in the Home Network
[x] Allow access for applications
[x] Transmit status information over UPnP
```

Credentials are not needed and, as such, you may want to consider using `http` instead of `https` as those requests are significantly faster.

Allowed fields (limited to a max of 4): `["connectionStatus", "uptime", "maxDown", "maxUp", "down", "up", "received", "sent", "externalIPAddress"]`.

```yaml
widget:
  type: fritzbox
  url: http://192.168.178.1
```
