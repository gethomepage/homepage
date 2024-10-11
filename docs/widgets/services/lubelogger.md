---
title: LubeLogger
description: LubeLogger Widget Configuration
---

Learn more about [LubeLogger](https://github.com/hargata/lubelog) (v1.3.7 or higher is required).

The widget comes in two 'flavors', one shows data for all vehicles or for just a specific vehicle with the `vehicleID` parameter.

Allowed fields: `["vehicles", "serviceRecords", "reminders"]`.
For the single-vehicle version: `["vehicle", "serviceRecords", "reminders", "nextReminder"]

```yaml
widget:
  type: lubelogger
  url: https://lubelogger.host.or.ip
  username: lubeloggerusername
  password: lubeloggerpassword
  vehicleID: 1 # optional, changes to single-vehicle version
```
