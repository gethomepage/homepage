---
title: Synapse (Matrix)
description: Synapse (Matrix) Widget Configuration
---

This widget displays statistics of your Synapse Matrix homeserver, showing registered users, stored rooms, and federated peers.

Note that the URL provided in the widget should be one that has access to the Admin API at `/_synapse/admin/`. This API is not normally publicly accessible behind a reverse proxy, so be sure to use a URL that points to the homeserver locally.

For obtaining your access_token, see the [documentation on the Admin API](https://matrix-org.github.io/synapse/latest/usage/administration/admin_api/index.html). Element lets you obtain it through `All Settings > Help & About > Advanced > Access Token`.

Allowed fields: `["users", "rooms", "peers"]`.

```yaml
widget:
  type: synapse
  url: http://synapse.host.or.ip:port
  key: access_token
```