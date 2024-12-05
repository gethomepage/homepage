---
title: RackNerd
description: RackNerd Widget Configuration
---

Learn more about [RackNerd](https://racknerd.com).

Use key & hash. Information about the key & hash can be found under the [VPS](https://nerdvm.racknerd.com) control panel in the API section.

Allowed fields: `["ipAddress", "hddtotal", "bandwidthfree", "bandwidthused"]`.

Note `"memoryusage"` is deprecated as v1 of their API result will be always be 0.
Note `"status"` is not fully implemented.

Note hard drive free/used/percentage isn't functioning in v1 of their API result.
```yaml
widget:
  type: racknerd
  url: https://nerdvm.racknerd.com
  key: token
  hash: token
```
