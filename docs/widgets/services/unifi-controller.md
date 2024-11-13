---
title: Unifi Controller
description: Unifi Controller Widget Configuration
---

Learn more about [Unifi Controller](https://ui.com/).

_(Find the Unifi Controller information widget [here](../info/unifi_controller.md))_

You can display general connectivity status from your Unifi (Network) Controller. When authenticating you will want to use a local account that has at least read privileges.

An optional 'site' parameter can be supplied, if it is not the widget will use the default site for the controller.

Allowed fields: `["uptime", "wan", "lan", "lan_users", "lan_devices", "wlan", "wlan_users", "wlan_devices"]` (maximum of four). Fields unsupported by the unifi device will not be shown.

!!! hint

    If you enter e.g. incorrect credentials and receive an "API Error", you may need to recreate the container to clear the cache.

A UI account with 2FA will not work, to get around this:

1. Create a new user.
2. Check `Restrict to local access only`.
3. Set the username. eg. `remote_stats`.
4. Set a strong password.
5. Set permissions:
    1. Uncheck `Use a pre-defined role`.
    2. Set `Network` to `View Only`
    3. Set all other options to `None`
6. Click `Add`

```yaml
widget:
  type: unifi
  url: https://unifi.host.or.ip:port
  username: username
  password: password
  site: Site Name # optional
```

_Added in v0.4.18, updated in 0.6.7_
