---
title: pfSense
description: pfSense Widget Configuration
---

Learn more about [pfSense](https://github.com/pfsense/pfsense).

This widget requires the installation of the [pfsense-api](https://github.com/jaredhendrickson13/pfsense-api) which is a 3rd party package for pfSense routers.

Once pfSense API is installed, you can set the API to be read-only in System > API > Settings.

There are two currently supported authentication modes: 'Local Database' and 'API Token'. To for 'Local Database', use the `username` and `password` fields with the credentials of a pfSense admin user. For 'API Token', utilize the `headers` parameter as shown below. When generating a new key, the client_token will be shown once at the top of the page in an alert box and the client_id will be at the bottom of the page. Do not use both `headers` and `username`/`password`.

The interface to monitor is defined by updating the `wan` param. It should be referenced as it is shown under Interfaces > Assignments in the 'Network port' column next to the MAC address.

Load is returned instead of cpu utilization. This is a limitation in the pfSense API due to the complexity of this calculation. This may become available in future versions.

Allowed fields: `["load", "memory", "temp", "wanStatus", "wanIP", "disk"]` (maximum of 4)

```yaml
widget:
  type: pfsense
  url: http://pfsense.host.or.ip:port
  username: user # optional- use if avoiding api keys (headers)
  password: pass # optional- use if avoiding api keys (headers)
  headers: # for use with API keys instead of username/password
    Authorization: client_id client_token
  wan: igb0
```
