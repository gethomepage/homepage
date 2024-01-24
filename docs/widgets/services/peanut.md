---
title: PeaNUT
description: PeaNUT Widget Configuration
---

Learn more about [PeaNUT](https://github.com/Brandawg93/PeaNUT).

This widget adds support for [Network UPS Tools](https://networkupstools.org/) via a third party tool, [PeaNUT](https://github.com/Brandawg93/PeaNUT).

The default ups name is `ups`. To configure more than one ups, you must create multiple peanut services.

Allowed fields: `["battery_charge", "ups_load", "ups_status"]`

!!! note

    This widget requires an additional tool, [PeaNUT](https://github.com/Brandawg93/PeaNUT), as noted. Other projects exist to achieve similar results using a `customapi` widget, for example [NUTCase](https://github.com/ArthurMitchell42/nutcase#using-nutcase-homepage).

```yaml
widget:
  type: peanut
  url: http://peanut.host.or.ip:port
  key: nameofyourups
```
