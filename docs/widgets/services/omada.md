---
title: Omada
description: Omada Widget Configuration
---

The widget supports controller versions 3, 4, 5 and 6.

Allowed fields: `["connectedAp", "activeUser", "alerts", "connectedGateways", "connectedSwitches"]`.

Use an Omada controller account for `username` and `password`. An Open API application's Client ID and Client Secret are not account credentials.

```yaml
widget:
  type: omada
  url: http://omada.host.or.ip:port
  username: username
  password: password
  site: sitename
```
