---
title: Nextcloud
description: Nextcloud Widget Configuration
---

Use username & password, or the `NC-Token` key.
Information about the token can be found under **Settings** > **System** (my.nextcloud.domain/settings/admin/serverinfo, at the bottom of the page).
A username & a password dedicated to homepage can be used for more security (my.nextcloud.domain/settings/user/security, at the bottom of the page).
If both are provided, NC-Token will be used.


Allowed fields: `["cpuload", "memoryusage", "freespace", "activeusers", "numfiles", "numshares"]`.

Note "cpuload" and "memoryusage" were deprecated in v0.6.18 and a maximum of 4 fields can be displayed.

```yaml
widget:
  type: nextcloud
  url: https://nextcloud.host.or.ip:port
  key: token
```

```yaml
widget:
  type: nextcloud
  url: https://nextcloud.host.or.ip:port
  username: username
  password: password
```
