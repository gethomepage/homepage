---
title: AirTrail
description: AirTrail Widget Configuration
---

Learn more about [AirTrail](https://github.com/johanohly/AirTrail).

An API key is required. Generate one in AirTrail under **Settings → Security**.

Allowed fields (limited to a max of 4): `["flights", "distance", "duration", "airports", "topAirline", "topAirport", "topAircraft", "topRoute"]`

```yaml
widget:
  type: airtrail
  url: http://airtrail.host.or.ip:port
  key: yourapikey
```
