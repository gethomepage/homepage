---
title: Unifi Controller
description: Unifi Controller Information Widget Configuration
---

_(Find the Unifi Controller service widget [here](../services/unifi-controller.md))_

You can display general connectivity status from your Unifi (Network) Controller. When authenticating you will want to use a local account that has at least read privileges.

An optional 'site' parameter can be supplied, if it is not the widget will use the default site for the controller.

!!! hint

    If you enter e.g. incorrect credentials and receive an "API Error", you may need to recreate the container to clear the cache.

<img width="162" alt="unifi_infowidget" src="https://user-images.githubusercontent.com/4887959/197706832-f5a8706b-7282-4892-a666-b7d999752562.png">

!!!

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
- unifi_console:
    url: https://unifi.host.or.ip:port
    username: user
    password: pass
    site: Site Name # optional
```

_Added in v0.4.18, updated in 0.6.7_
