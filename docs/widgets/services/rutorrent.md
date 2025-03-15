---
title: ruTorrent
description: ruTorrent Widget Configuration
---

Learn more about [ruTorrent](https://github.com/Novik/ruTorrent).

This requires the `httprpc` plugin to be installed and enabled, and is part of the default ruTorrent plugins. If you have not explicitly removed or disable this plugin, it should be available.

Allowed fields: `["active", "upload", "download"]`.

```yaml
widget:
  type: rutorrent
  url: http://rutorrent.host.or.ip
  username: username # optional, false if not used
  password: password # optional, false if not used
```

Some seedboxes may use an alternate XMLRPC endpoint, if that's the case the below configuration may work
```yaml
widget:
  type: rutorrent
  xmlrpc: true
  host: http://rutorrent.host.or.ip
  endpoint: /xmlrpc
  username: username # optional, false if not used
  password: password # optional, false if not used
```
