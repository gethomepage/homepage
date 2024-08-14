---
title: Omada
description: Omada Widget Configuration
---

The widget supports controller versions 3, 4 and 5.

In order to restrict the user for API access to the bare minimum, one has to follow these steps:

1. Change organization to `Global View`
2. Go to `Account` settings in the lower left corner
3. Navigate to `Role` in the upper bar and add a new Role with the following priviliges
    1. Site - `Dashboard Manager` to `View only`
    2. Site - `Log Manager` to `View only`
4. Choose a name of your liking
5. Go back to `User` in the upper bar and create a new user for your homepage with the just created Role
6. Select the sites, this API User should have access to

Now you can use the `username` and `password` of this User, having only the required privileges for all allowed fields.

Allowed fields: `["connectedAp", "activeUser", "alerts", "connectedGateways", "connectedSwitches"]`.

```yaml
widget:
  type: omada
  url: http://omada.host.or.ip:port
  username: username
  password: password
  site: sitename
```
