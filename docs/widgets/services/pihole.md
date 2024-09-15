---
title: PiHole
description: PiHole Widget Configuration
---

Learn more about [PiHole](https://github.com/pi-hole/pi-hole).

Allowed fields: `["queries", "blocked", "blocked_percent", "gravity"]`.

Note: by default the "blocked" and "blocked_percent" fields are merged e.g. "1,234 (15%)" but explicitly including the "blocked_percent" field will change them to display separately.

```yaml
widget:
  type: pihole
  url: http://pi.hole.or.ip
  version: 6 # required if running v6 or higher, defaults to 5
  key: yourpiholeapikey # optional
```
