---
title: HDHomerun
description: HDHomerun Widget Configuration
---

Learn more about [HDHomerun](https://www.silicondust.com/support/downloads/).

Allowed fields: `["channels", "hd", "tunerCount", "channelNumber", "channelNetwork", "signalStrength", "signalQuality", "symbolQuality", "networkRate", "clientIP" ]`.

If more than 4 fields are provided, only the first 4 are displayed.

```yaml
widget:
  type: hdhomerun
  url: http://hdhomerun.host.or.ip
  tuner: 0 # optional - defaults to 0, used for tuner-specific fields
  fields: ["channels", "hd"] # optional - default fields shown
```
