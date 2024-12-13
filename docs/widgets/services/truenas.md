---
title: TrueNas
description: TrueNas Scale Widget Configuration
---

Learn more about [TrueNas](https://www.truenas.com/).

Allowed fields: `["load", "uptime", "alerts"]`.

To create an API Key, follow [the official TrueNAS documentation](https://www.truenas.com/docs/scale/scaletutorials/toptoolbar/managingapikeys/).

A detailed pool listing is disabled by default, but can be enabled with the `enablePools` option.

To use the `enablePools` option with TrueNAS Core, the `nasType` parameter is required.

```yaml
widget:
  type: truenas
  url: http://truenas.host.or.ip
  username: user # not required if using api key
  password: pass # not required if using api key
  key: yourtruenasapikey # not required if using username / password
  enablePools: true # optional, defaults to false
  nasType: scale # defaults to scale, must be set to 'core' if using enablePools with TrueNAS Core
```
