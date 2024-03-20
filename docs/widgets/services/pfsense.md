---
title: pfSense
description: pfSense Widget Configuration
---

Learn more about [pfSense](https://github.com/pfsense/pfsense).

This widget requires the installation of the [pfsense-api](https://github.com/jaredhendrickson13/pfsense-api) which is a 3rd party package for pfSense routers.

Once pfSense API is installed, you can set the API to be read-only in System > API > Settings.

There are two currently supported authentication modes: 'Local Database' and 'API Token'. For 'Local Database', use `username` and `password` with the credentials of an admin user. For 'API Token', utilize the `headers` parameter with `client_token` and `client_id` obtained from pfSense as shown below. Do not use both headers and username / password.

The interface to monitor is defined by updating the `wan` parameter. It should be referenced as it is shown under Interfaces > Assignments in pfSense.

Load is returned instead of cpu utilization. This is a limitation in the pfSense API due to the complexity of this calculation. This may become available in future versions.

Allowed fields: `["load", "memory", "temp", "wanStatus", "wanIP", "disk"]` (maximum of 4)

```yaml
widget:
  type: pfsense
  url: http://pfsense.host.or.ip:port
  username: user # optional, or API token
  password: pass # optional, or API token
  headers: # optional, or username/password
    Authorization: client_id client_token
  wan: igb0
  fields: ["load", "memory", "temp", "wanStatus"] # optional
```
