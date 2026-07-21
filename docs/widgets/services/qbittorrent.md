---
title: qBittorrent
description: qBittorrent Widget Configuration
---

Learn more about [qBittorrent](https://github.com/qbittorrent/qBittorrent).

Authenticate using the WebUI username and password or the API key `(qBittorrent ≥ v5.2.0)`. If both are provided, the API key will be used.

API Key is located in `Options > WebUI > Authentication > API Key`.

Allowed fields: `["leech", "download", "seed", "upload"]`.

```yaml
widget:
  type: qbittorrent
  url: http://qbittorrent.host.or.ip
  username: username
  password: password
  enableLeechProgress: true # optional, defaults to false
  enableLeechSize: true # optional, defaults to false
```

```yaml
widget:
  type: qbittorrent
  url: http://qbittorrent.host.or.ip
  key: qbt_apikey
  enableLeechProgress: true # optional, defaults to false
  enableLeechSize: true # optional, defaults to false
```
