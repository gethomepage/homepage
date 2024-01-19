---
title: EVCC
description: EVCC Widget Configuration
---

[EVSS](https://github.com/evcc-io/evcc) - evcc is an extensible EV Charge Controller with PV integration implemented in Go.

Allowed fields: `["pv_power", "grid_power", "home_power", "charge_power]`.

```yaml
widget:
  type: evcc
  url: http://evcc.host.or.ip:port
```
