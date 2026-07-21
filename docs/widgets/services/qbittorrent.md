---
title: qBittorrent
description: qBittorrent Widget Configuration
---

Learn more about [qBittorrent](https://github.com/qbittorrent/qBittorrent).

Authenticate using the WebUI username and password or the API Key `(qBittorrent ≥ v5.2.0)`.

API Key is located in `Options > WebUI > Authentication > API Key`.

Allowed fields: `["leech", "download", "seed", "upload"]`.

```yaml
widget:
  type: qbittorrent
  url: http://qbittorrent.host.or.ip
  username: username
  password: password
  key: qbt_apikey # required if using API key instead of username/password
  enableLeechProgress: true # optional, defaults to false
  enableLeechSize: true # optional, defaults to false
```
