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

You don't need to provide any credentials. Since that, you should consider using `http` instead of `https` as the requests are significantly faster.

Allowed fields (limited to a max of 4): `["connectionStatus", "upTime", "maxDown", "maxUp", "down", "up", "received", "sent", "externalIPAddress"]`.

```yaml
widget:
  type: fritzbox
  url: http://192.168.178.1
```
