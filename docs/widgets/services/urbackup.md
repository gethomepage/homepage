---
title: UrBackup
description: UrBackup Widget Configuration
---

Learn more about [UrBackup](https://github.com/uroni/urbackup_backend).

The UrBackup widget retrieves the total number of clients that currently have no errors, have errors, or haven't backed up recently. Clients are considered "Errored" or "Out of Date" if either the file or image backups for that client have errors/are out of date, unless the client does not support image backups.

The default number of days that can elapse before a client is marked Out of Date is 3, but this value can be customized by setting the `maxDays` value in the config.

Optionally, the widget can also report the total amount of disk space consumed by backups. This is disabled by default, because it requires a second API call.

Note: client status is only shown for backups that the specified user has access to. Disk Usage shown is the total for all backups, regardless of permissions.

Allowed fields: `["ok", "errored", "noRecent", "totalUsed"]`. _Note that `totalUsed` will not be shown unless explicitly included in `fields`._

```yaml
widget:
  type: urbackup
  username: urbackupUsername
  password: urbackupPassword
  url: http://urbackupUrl:55414
  maxDays: 5 # optional
```
