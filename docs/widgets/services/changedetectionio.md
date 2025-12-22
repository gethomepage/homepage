---
title: Changedetection.io
description: Changedetection.io Widget Configuration
---

Learn more about [Changedetection.io](https://github.com/dgtlmoon/changedetection.io).

Find your API key under `Settings > API`.

Allowed fields: `["diffsDetected", "totalObserved"]`.

```yaml
widget:
  type: changedetectionio
  url: http://changedetection.host.or.ip:port
  key: apikeyapikeyapikeyapikeyapikey
```

You can also add custom HTTP headers for authentication (e.g., for services behind a reverse proxy like Traefik):

```yaml
widget:
  type: changedetectionio
  url: http://changedetection.host.or.ip:port
  key: apikeyapikeyapikeyapikeyapikey
  http_header:
    X-Auth-Key: abcabcabc
```
