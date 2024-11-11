---
title: Suwayomi
description: Suwayomi Widget Configuration
---

Learn more about [Suwayomi](https://github.com/Suwayomi/Suwayomi-Server).

all supported fields shown in example yaml, though a max of 4 will show at one time.
The default fields are download, nondownload, read and unread.
category defaults to "all" if left unset or set to not a number.
The category ID can be obtained from the url when navigating to it, `?tab={categoryID}`.
username and password are available if you have basic auth setup for Suwayomi.

```yaml
widget:
  icon: https://raw.githubusercontent.com/Suwayomi/Suwayomi-Server/refs/heads/master/server/src/main/resources/icon/faviconlogo-128.png
  widget:
    type: suwayomi
    url: http://suwayomi.host.or.ip
    username: username
    password: password
    category: 0
    fields:
      - download
      - nondownload
      - read
      - unread
      - downloadedRead
      - downloadedunread
      - nondownloadedread
      - nondownloadedunread
```
