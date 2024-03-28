---
title: Deluge
description: Deluge Widget Configuration
---

Learn more about [Deluge](https://deluge-torrent.org/).

Uses the same password used to login to the webui, see [the deluge FAQ](https://dev.deluge-torrent.org/wiki/Faq#Whatisthedefaultpassword).

Allowed fields: `["leech", "download", "seed", "upload"]`.

```yaml
widget:
  type: deluge
  url: http://deluge.host.or.ip
  password: password # webui password
```
