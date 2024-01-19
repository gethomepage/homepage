---
title: Synology Download Station
description: Synology Download Station Widget Configuration
---

[Synology Download Station](https://www.synology.com/en-us/dsm/packages/DownloadStation) - Download Station is a web-based download application add-on for Synology DiskStation Manager, which allows you to download files from the Internet through BT, FTP, HTTP, NZB, FlashGet, QQDL, and eMule, and subscribe to RSS feeds to keep you updated on the hottest or latest BT.

Note: the widget is not compatible with 2FA.

Allowed fields: `["leech", "download", "seed", "upload"]`.

```yaml
widget:
  type: downloadstation
  url: http://downloadstation.host.or.ip:port
  username: username
  password: password
```
