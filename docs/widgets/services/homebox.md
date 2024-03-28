---
title: Homebox
description: Homebox Widget Configuration
---

Learn more about [Homebox](https://github.com/hay-kot/homebox).

Uses the same username and password used to login from the web.

The `totalValue` field will attempt to format using the currency you have configured in Homebox.

Allowed fields: `["items", "totalWithWarranty", "locations", "labels", "users", "totalValue"]`.

If more than 4 fields are provided, only the first 4 are displayed.

```yaml
widget:
  type: homebox
  url: http://homebox.host.or.ip:port
  username: username
  password: password
  fields: ["items", "locations", "totalValue"] # optional - default fields shown
```
