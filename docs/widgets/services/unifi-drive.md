---
title: UniFi Drive
description: UniFi Drive Widget Configuration
---

Learn more about [UniFi Drive](https://ui.com/integrations/network-storage).

## Configuration

Displays storage statistics from your UniFi Network Attached Storage (UNAS) device.

```yaml
widget:
  type: unifi_drive
  url: https://unifi.host.or.ip
  username: your_username
  password: your_password
```

Allowed fields: `["url", "username", "password"]`

!!! warning

    Requires a local UniFi account with at least read privileges.

!!! hint

    If you receive an "API Error" with incorrect credentials, you may need to recreate the container or restart the service to clear the cache.

## Fields

The widget displays the following storage statistics:

- `total` - Total storage capacity
- `used` - Used storage amount
- `available` - Free storage space
- `status` - Health status (Healthy/Degraded)
