---
title: Kopia
description: Kopia Widget Configuration
---

[Kopia](https://github.com/kopia/kopia) - Cross-platform backup tool for Windows, macOS & Linux with fast, incremental backups, client-side end-to-end encryption, compression and data deduplication. CLI and GUI included.

Allowed fields: `["status", "size", "lastrun", "nextrun"]`.

You may optionally pass values for `snapshotHost` and / or `snapshotPath` to select a specific backup source for the widget.

```yaml
widget:
  type: kopia
  url: http://kopia.host.or.ip:port
  username: username
  password: password
  snapshotHost: hostname # optional
  snapshotPath: path # optional
```
