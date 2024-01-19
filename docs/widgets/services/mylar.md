---
title: Mylar3
description: Mylar3 Widget Configuration
---

[Mylar3](https://github.com/mylar3/mylar3) - The python3 version of the automated Comic Book downloader (cbr/cbz) for use with various download clients.

API must be enabled in Mylar3 settings.

Allowed fields: `["series", "issues", "wanted"]`.

```yaml
widget:
  type: mylar
  url: http://mylar3.host.or.ip:port
  key: yourmylar3apikey
```
