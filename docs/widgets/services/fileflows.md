---
title: Fileflows
description: Fileflows Widget Configuration
---

Learn more about [FileFlows](https://github.com/revenz/FileFlows).

Allowed fields: `["queue", "processing", "processed", "time"]` (version 1) or `["queue", "processing", "processed", "failed"]` (version 2).

| FileFlows Version | Homepage Widget Version |
| ----------------- | ----------------------- |
| < 26.10           | 1 (default)             |
| >= 26.10          | 2                       |

Version 2 uses the ["Fenrus Dashboard Endpoint"](https://fileflows.com/docs/webconsole/config/settings/general#fenrus-dashboard-endpoint), which must be enabled. Use the token shown there as the `key`.

```yaml
widget:
  type: fileflows
  url: http://your.fileflows.host:port
  version: 2 # optional, defaults to 1
  key: yourfenrustoken # required for version 2
```
