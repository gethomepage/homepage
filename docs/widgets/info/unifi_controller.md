---
title: Unifi Controller
description: Unifi Controller Information Widget Configuration
---

_(Find the Unifi Controller service widget [here](../services/unifi-controller.md))_

You can display general connectivity status from your Unifi (Network) Controller.

!!! warning

    When authenticating you will want to use a local account that has at least read privileges.

An optional 'site' parameter can be supplied, if it is not the widget will use the default site for the controller.

!!! hint

    If you enter e.g. incorrect credentials and receive an "API Error", you may need to recreate the container to clear the cache.

<img width="162" alt="unifi_infowidget" src="https://user-images.githubusercontent.com/4887959/197706832-f5a8706b-7282-4892-a666-b7d999752562.png">

```yaml
- unifi_console:
    url: https://unifi.host.or.ip:port
    site: Site Name # optional
    username: user
    password: pass
    key: unifiapikey # required if using API key instead of username/password
```
