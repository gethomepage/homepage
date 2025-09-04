---
title: pfSense
description: pfSense Widget Configuration
---

Learn more about [pfSense](https://github.com/pfsense/pfsense).

This widget requires the installation of the [pfsense-api](https://github.com/jaredhendrickson13/pfsense-api) which is a 3rd party package for pfSense routers.

Once pfSense API is installed, you can set the API to be read-only in System > API > Settings.

There are two currently supported authentication modes: 'Local Database' and 'API Key' (v2) / 'API Token' (v1). For 'Local Database', use `username` and `password` with the credentials of an admin user. The specifics of using the API key / token depend on the version of the pfSense API, see the config examples below. Do not use both headers and username / password.

The interface to monitor is defined by updating the `wan` parameter. It should be referenced as it is shown under Interfaces > Assignments in pfSense.

## Dual WAN Support

For dual WAN configurations with failover, you can monitor both interfaces by adding the `wan2` parameter. When both WANs are configured with API version 2, the widget will:

- Display the status of both WAN interfaces
- Show which WAN is configured as Primary vs Backup based on your gateway group tiers
- Indicate the currently active WAN with **bold text**
- Automatically detect failover states based on gateway status

## Configuration Notes

Load is returned instead of cpu utilization. This is a limitation in the pfSense API due to the complexity of this calculation. This may become available in future versions.

Allowed fields: `["load", "memory", "temp", "wanStatus", "wanIP", "wan2Status", "wan2IP", "disk"]` (maximum of 6 recommended for single row display)

## Configuration Examples

### Basic Single WAN Setup (Version 2)

```yaml
widget:
  type: pfsense
  url: http://pfsense.host.or.ip:port
  headers:
    X-API-Key: your-api-key
  wan: igb0
  version: 2
  fields: ["load", "memory", "temp", "wanStatus", "wanIP", "disk"]
```

### Dual WAN with Failover (Version 2)

```yaml
widget:
  type: pfsense
  url: https://pfsense.host.or.ip:port
  headers:
    X-API-Key: your-api-key
  wan: igc0 # Interface name for WAN 1 (check Interfaces > Assignments)
  wan2: igc2 # Interface name for WAN 2 (check Interfaces > Assignments)
  version: 2 # Required for dual WAN support
  fields: ["load", "memory", "wanStatus", "wanIP", "wan2Status", "wan2IP"]
```

When configured for dual WAN:

- The widget automatically detects your gateway group configuration
- "(Primary)" label shows next to the Tier 1 gateway
- "(Backup)" label shows next to the Tier 2 gateway
- Bold text indicates which WAN is actively routing traffic
- Failover detection works automatically based on gateway status

### Version 1 Configuration

```yaml
widget:
  type: pfsense
  url: http://pfsense.host.or.ip:port
  headers:
    Authorization: client_id client_token # obtained from pfSense API
  wan: igb0
  version: 1
  fields: ["load", "memory", "temp", "wanStatus", "wanIP"]
```

**Note:** Dual WAN support requires API version 2.

## Troubleshooting

### Finding Your Interface Names

1. Log into your pfSense web interface
2. Navigate to **Interfaces > Assignments**
3. Note the interface names (e.g., `igc0`, `igc1`, `igb0`)
4. Use these exact names in your widget configuration

### Setting Up Gateway Groups for Failover

For the dual WAN feature to properly detect primary/backup status:

1. Navigate to **System > Routing > Gateway Groups**
2. Create a failover group with your two WAN gateways
3. Set Tier 1 for your primary WAN
4. Set Tier 2 for your backup WAN
5. The widget will automatically detect this configuration

### Common Issues

- **WAN2 fields not showing:** Ensure you're using API version 2 and have included the wan2 fields in your configuration
- **No Primary/Backup labels:** These only appear when `wan2` is configured
- **Incorrect active WAN indication:** Verify your gateway group is properly configured in pfSense
