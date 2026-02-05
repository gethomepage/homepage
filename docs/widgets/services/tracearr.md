---
title: Tracearr
description: Tracearr Widget Configuration
---

Learn more about [Tracearr](https://www.tracearr.com/).

Provides detailed information about currently active Plex streams across multiple servers.

Allowed fields (for summary view): `["streams", "transcodes", "directplay", "bitrate"]`.

```yaml
widget:
  type: tracearr
  url: http://tracearr.host.or.ip:3002
  key: apikeyapikeyapikeyapikeyapikey
  view: both # optional, "summary", "details", or "both", defaults to "details"
  enableUser: true # optional, defaults to false
  showEpisodeNumber: true # optional, defaults to false
  expandOneStreamToTwoRows: false # optional, defaults to true
```
