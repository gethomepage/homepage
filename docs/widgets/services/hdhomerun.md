---
title: HDHomerun
description: HDHomerun Widget Configuration
---

[HDHomerun](https://www.silicondust.com/support/downloads/)

Allowed fields: `["channels", "hd", "tunerCount", "channelNumber", "channelNetwork", "signalStrength", "signalQuality", "symbolQuality, "networkRate", "clientIP" ]`.

If more than 4 fields are provided, only the first 4 are displayed. The
order that fields are configured is preserved for display.

```yaml
tuner: 0 # optional - defaults to 0, used for tuner-specific fields
widget:
  type: hdhomerun
  url: http://hdhomerun.host.or.ip
  refreshInterval: 10000 # optional - minimum of 1 sec, default of 10s
  fields: ["channels", "hd"] # optional - default fields shown
```
