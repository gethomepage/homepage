---
title: Tailscale
description: Tailscale Widget Configuration
---

Learn more about [Tailscale](https://github.com/tailscale/tailscale).

You will need to generate an API access token from the [keys page](https://login.tailscale.com/admin/settings/keys) on the Tailscale dashboard.

To find your device ID, go to the [machine overview page](https://login.tailscale.com/admin/machines) and select your machine. In the "Machine Details" section, copy your `ID`. It will end with `CNTRL`.

Allowed fields: `["address", "last_seen", "expires", "user", "name", "hostname", "client_version", "update_available", "os", "created", "last_seen", "expires", "authorized", "is_external", "tags"]`.

See [Tailscale's API reference](https://tailscale.com/api#tag/devices/get/device/{deviceId}) for more information on each field.

```yaml
widget:
  type: tailscale
  deviceid: deviceid
  key: tailscalekey
```
