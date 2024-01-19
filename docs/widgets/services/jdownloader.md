---
title: JDownloader
description: NextPVR Widget Configuration
---

[JDownloader](https://jdownloader.org/) - JDownloader is a free, open-source download management tool with a huge community that makes downloading as easy and fast as it should be. Users can start, stop or pause downloads, set bandwith limitations, auto-extract archives and much more.

Basic widget to show number of items in download queue, along with the queue size and current download speed.

Allowed fields: `["downloadCount", "downloadTotalBytes","downloadBytesRemaining", "downloadSpeed"]`.

```yaml
widget:
  type: jdownloader
  username: JDownloader Username
  password: JDownloader Password
  client: Name of JDownloader Instance
```
