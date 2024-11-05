---
title: Teslamate
description: Teslamate Widget Configuration
---

Learn more about [Teslamate](https://docs.teslamate.org/docs/installation/docker).
But you need an API exposed on your server, we recommend to use this [TeslamateAPI](https://github.com/tobiasehlert/teslamateapi).

Allowed fields: `["car_name", "odometer", "battery_level"]`.

A list of the next 5 tasks ordered by due date is disabled by default, but can be enabled with the `enableTaskList` option.

```yaml
widget:
  type: teslamate
  url: http[s]://teslamateapi.host.or.ip[:port]
  car_id: id_of_your_car_in_teslamate
```
