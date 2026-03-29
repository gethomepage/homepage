---
title: UniFi Drive
description: UniFi Drive Widget Configuration
---

Learn more about [UniFi Drive](https://ui.com/integrations/network-storage).

## Configuration

Displays storage statistics from your UniFi Network Attached Storage (UNAS) device. Requires a local UniFi account with at least read privileges.

Allowed fields: `["total", "used", "available", "status"]`

```yaml
widget:
  type: unifi_drive
  url: https://unifi.host.or.ip
  username: your_username
  password: your_password
```

!!! tip

    If you enter incorrect credentials and receive an "API Error", you may need to recreate the container or restart the service to clear the cache.
