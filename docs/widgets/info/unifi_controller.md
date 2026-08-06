---
title: Unifi Controller
description: Unifi Controller Information Widget Configuration
---

_(Find the Unifi Controller service widget [here](../services/unifi-controller.md))_

You can display general connectivity status from your Unifi (Network) Controller.

!!! warning

    When authenticating you will want to use a local account that has at least read privileges.

An optional 'site' parameter can be supplied, if it is not the widget will use the default site for the controller.

!!! tip

    If you enter e.g. incorrect credentials and receive an "API Error", you may need to recreate the container to clear the cache.

<img width="162" alt="unifi_infowidget" src="https://user-images.githubusercontent.com/4887959/197706832-f5a8706b-7282-4892-a666-b7d999752562.png">

```yaml
- unifi_console:
    url: https://unifi.host.or.ip:port
    site: Site Name # optional
    username: user
    password: pass
    key: unifiapikey # required if using API key instead of username/password
    version: 1 # optional, 1 (default) or 2, see below
```

## API versions

| `version` | API                                             | Authentication           | Use for                   |
| --------- | ----------------------------------------------- | ------------------------ | ------------------------- |
| `1`       | Legacy Network API (`/api/...`) — **default**   | username/password or key | Unifi Network Application |
| `2`       | Network Integration API (`/integration/v1/...`) | API key only             | UniFi OS Server           |

Use `version: 2` for UniFi OS Server, where the legacy `stat/sites` endpoint is
not available.

The `site` parameter refers to the site name as reported by the Integration API,
which is the display name (e.g. `Default`), not the internal slug.

!!! note

    UniFi OS Server listens on port 11443 by default.

```yaml
widget:
  type: unifi
  url: https://unifi.host.or.ip:11443
  key: unifiapikey
  version: 2
```
