---
title: Unifi Controller
description: Unifi Controller Widget Configuration
---

Learn more about [Unifi Controller](https://ui.com/).

_(Find the Unifi Controller information widget [here](../info/unifi_controller.md))_

You can display general connectivity status from your Unifi (Network) Controller. When authenticating you will want to use an account that has at least read privileges.

An optional 'site' parameter can be supplied, if it is not the widget will use the default site for the controller.

Allowed fields: `["uptime", "wan", "lan", "lan_users", "lan_devices", "wlan", "wlan_users", "wlan_devices"]` (maximum of four).

Note that fields unsupported by the unifi device will not be shown.

```yaml
widget:
  type: unifi
  url: https://unifi.host.or.ip:port
  username: username
  password: password
  site: Site Name # optional
```

_Added in v0.4.18, updated in 0.6.7_
