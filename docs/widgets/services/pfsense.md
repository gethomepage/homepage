---
title: pfSense
description: pfSense Widget Configuration
---

Learn more about [pfSense](https://github.com/pfsense/pfsense).

This widget requires the installation of the [pfsense-api](https://github.com/jaredhendrickson13/pfsense-api) which is a 3rd party package for pfSense routers.

Once pfSense API is installed, you can set the API to be read-only in System > API > Settings.

There are two currently supported authentication modes: 'Local Database' and 'API Key' (v2) / 'API Token' (v1). For 'Local Database', use `username` and `password` with the credentials of an admin user. The specifics of using the API key / token depend on the version of the pfSense API, see the config examples below. Do not use both headers and username / password.

The interface to monitor is defined by updating the `wan` parameter. It should be referenced as it is shown under Interfaces > Assignments in pfSense.

Load is returned instead of cpu utilization. This is a limitation in the pfSense API due to the complexity of this calculation. This may become available in future versions.

Allowed fields: `["load", "memory", "temp", "wanStatus", "wanIP", "disk"]` (maximum of 4)

For version 2:

```yaml
widget:
  type: pfsense
  url: http://pfsense.host.or.ip:port
  username: user # optional, or API key
  password: pass # optional, or API key
  headers: # optional, or username/password
    X-API-Key: key
  wan: igb0
  version: 2 # optional, defaults to 1 for api v1
  fields: ["load", "memory", "temp", "wanStatus"] # optional
```

For version 1:

```yaml
headers: # optional, or username/password
  Authorization: client_id client_token # obtained from pfSense API
version: 1
```
