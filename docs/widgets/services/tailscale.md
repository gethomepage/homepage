---
title: Tailscale
description: Tailscale Widget Configuration
---

Learn more about [Tailscale](https://github.com/tailscale/tailscale).

You will need to generate an API access token from the [keys page](https://login.tailscale.com/admin/settings/keys) on the Tailscale dashboard.

## Single Device

To find your device ID, go to the [machine overview page](https://login.tailscale.com/admin/machines) and select your machine. In the "Machine Details" section, copy your `ID`. It will end with `CNTRL`.

Allowed fields: `["address", "last_seen", "expires"]`.

```yaml
widget:
  type: tailscale
  deviceid: deviceid
  key: tailscalekey
```

## Tailnet (All Devices)

To view all devices in your tailnet, use the `tailnet` option instead of `deviceid`. Your tailnet name can be found on the [Tailscale admin dashboard](https://login.tailscale.com/admin/settings/general).

Allowed fields: `["total_devices", "online", "offline"]`.

```yaml
widget:
  type: tailscale
  tailnet: your-tailnet-name
  key: tailscalekey
```

By default, the tailnet view shows a summary with device counts. To show a detailed list of all devices with their name, address, and online status, set `summaryView` to `false`:

```yaml
widget:
  type: tailscale
  tailnet: your-tailnet-name
  key: tailscalekey
  summaryView: false
```
