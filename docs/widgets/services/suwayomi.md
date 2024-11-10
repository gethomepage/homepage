---
title: Suwayomi
description: Suwayomi Widget Configuration
---

Learn more about [Suwayomi](https://github.com/Suwayomi/Suwayomi-Server).

all supported fields shown in example yaml, though a max of 4 will show at one time.
username and password are available if you have basic auth setup for Suwayomi.

```yaml
widget:
  icon: https://raw.githubusercontent.com/Suwayomi/Suwayomi-Server/refs/heads/master/server/src/main/resources/icon/faviconlogo-128.png
  widget:
    type: suwayomi
    url: http://suwayomi.host.or.ip
    username: username # if u have basic auth setup
    password: password # if u have basic auth setup
    category: 0 # to use a given categoryID defaults to all categories
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
