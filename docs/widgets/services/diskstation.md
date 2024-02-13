---
title: Synology Disk Station
description: Synology Disk Station Widget Configuration
---

Learn more about [Synology Disk Station](https://www.synology.com/en-global/dsm).

Note: the widget is not compatible with 2FA.

An optional 'volume' parameter can be supplied to specify which volume's free space to display when more than one volume exists. The value of the parameter must be in form of `volume_N`, e.g. to display free space for volume2, `volume_2` should be set as 'volume' value. If omitted, first returned volume's free space will be shown (not guaranteed to be volume1).

Allowed fields: `["uptime", "volumeAvailable", "resources.cpu", "resources.mem"]`.

To access these system metrics you need to connect to the DiskStation with an account that is a member of the default `Administrators` group. That is because these metrics are requested from the API's `SYNO.Core.System` part that is only available to admin users. In order to keep the security impact as small as possible we can set the account in DSM up to limit the user's permissions inside the Synology system. In DSM 7.x, for instance, follow these steps:

1. Create a new user, i.e. `remote_stats`.
2. Set up a strong password for the new user
3. Under the `User Groups` tab of the user config dialogue check the box for `Administrators`.
4. On the `Permissions` tab check the top box for `No Access`, effectively prohibiting the user from accessing anything in the shared folders.
5. Under `Applications` check the box next to `Deny` in the header to explicitly prohibit login to all applications.
6. Now _only_ allow login to the `Download Station` application, either by
   - unchecking `Deny` in the respective row, or (if inheriting permission doesn't work because of other group settings)
   - checking `Allow` for this app, or
   - checking `By IP` for this app to limit the source of login attempts to one or more IP addresses/subnets.
7. When the `Preview` column shows `Allow` in the `Download Station` row, click `Save`.

Now configure the widget with the correct login information and test it.

If you encounter issues during testing, make sure to uncheck the option for automatic blocking due to invalid logins under `Control Panel > Security > Protection`. If desired, this setting can be reactivated once the login is established working.

```yaml
widget:
  type: diskstation
  url: http://diskstation.host.or.ip:port
  username: username
  password: password
  volume: volume_N # optional
```
