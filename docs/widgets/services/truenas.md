---
title: TrueNas
description: TrueNas Scale Widget Configuration
---

Learn more about [TrueNas](https://www.truenas.com/).

Allowed fields: `["load", "uptime", "alerts"]`.

To create an API Key, follow [the official TrueNAS documentation](https://www.truenas.com/docs/scale/scaletutorials/toptoolbar/managingapikeys/).

```yaml
widget:
  type: truenas
  url: http://truenas.host.or.ip
  username: user # not required if using api key
  password: pass # not required if using api key
  key: yourtruenasapikey # not required if using username / password
```
