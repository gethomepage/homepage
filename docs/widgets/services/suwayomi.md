---
title: Suwayomi
description: Suwayomi Widget Configuration
---

Learn more about [Suwayomi](https://github.com/Suwayomi/Suwayomi-Server).

Allowed fields: ["download", "nondownload", "read", "unread", "downloadedread", "downloadedunread", "nondownloadedread", "nondownloadedunread"]

The widget defaults to the first four above. If more than four fields are provided, only the first 4 are displayed.
Category IDs can be obtained from the url when navigating to it, `?tab={categoryID}`.

```yaml
widget:
  type: suwayomi
  url: http://suwayomi.host.or.ip
  username: username #optional
  password: password #optional
  category: 0 #optional, defaults to all categories
```
