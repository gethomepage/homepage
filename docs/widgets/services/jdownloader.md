---
title: JDownloader
description: JDownloader Widget Configuration
---

Learn more about [JDownloader](https://jdownloader.org/).

Basic widget to show number of items in download queue, along with the queue size and current download speed.

**Requires MyJDownloader account for username, password and client [MyJDownloader](https://my.jdownloader.org/).**

Allowed fields: `["downloadCount", "downloadTotalBytes","downloadBytesRemaining", "downloadSpeed"]`.

```yaml
widget:
  type: jdownloader
  username: JDownloader Username
  password: JDownloader Password
  client: Name of JDownloader Instance
```
