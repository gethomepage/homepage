---
title: Unraid
description: Unraid Widget Configuration
---

Learn more about [Unraid](https://unraid.net/).

The Unraid widget allows you to monitor the resources of an Unraid server.

**Minimum Requirements:**

- Unraid 7.2 (starting with beta2) -or- Unraid Connect plugin 2025.08.19.1850
- API key with the **GUEST** (read only) role: [Managing API Keys](https://docs.unraid.net/API/how-to-use-the-api/#managing-api-keys)

The widget can display metrics for selected Unraid pools. If using one of the "pool" fields, you must also add the pool name to the settings.

**Allowed fields:** `["cpu","memoryPercent","memoryAvailable","memoryUsed","notifications","arrayFreeSpace","arrayUsedSpace","arrayUsedPercent","status","pool1UsedSpace","pool1FreeSpace","pool1UsedPercent","pool2UsedSpace","pool2FreeSpace","pool2UsedPercent","pool3UsedSpace","pool3FreeSpace","pool3UsedPercent","pool4UsedSpace","pool4FreeSpace","pool4UsedPercent"]`

```yaml
widget:
  type: unraid
  url: https://unraid.host.or.ip
  key: api-key
  pool1: # optional, name of pool for pool1... fields
  pool2: # optional, name of pool for pool2... fields
  pool3: # optional, name of pool for pool3... fields
  pool4: # optional, name of pool for pool4... fields
```
