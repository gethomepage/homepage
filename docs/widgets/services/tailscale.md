---
title: Tailscale
description: Tailscale Widget Configuration
---

Learn more about [Tailscale](https://github.com/tailscale/tailscale).

You will need to generate an API access token from the [keys page](https://login.tailscale.com/admin/settings/keys) on the Tailscale dashboard.

To find your device ID, go to the [machine overview page](https://login.tailscale.com/admin/machines) and select your machine. In the "Machine Details" section, copy your `ID`. It will end with `CNTRL`.

Allowed fields: `["address", "last_seen", "expires"]`.

```yaml
widget:
  type: tailscale
  deviceid: deviceid
  key: tailscalekey
```
