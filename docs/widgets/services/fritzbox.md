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

You don't need to provide any credentials.

Allowed fields (limited to a max of 4): `["connectionStatus", "upTime", "maxDown", "maxUp", "down", "up", "received", "sent", "externalIPAddress"]`.

```yaml
widget:
  type: fritzbox
  url: https://192.168.178.1
```
