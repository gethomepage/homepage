---
title: Kopia
description: Kopia Widget Configuration
---

Learn more about [Kopia](https://github.com/kopia/kopia).

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
