---
title: Immich
description: Immich Widget Configuration
---

Learn more about [Immich](https://github.com/immich-app/immich).

| Immich Version | Homepage Widget Version |
| -------------- | ----------------------- |
| < v1.118       | 1 (default)             |
| >= v1.118      | 2                       |

Find your API key under `Account Settings > API Keys`. The key should have the
`server.statistics` permission.

Allowed fields: `["users" ,"photos", "videos", "storage"]`.

```yaml
widget:
  type: immich
  url: http://immich.host.or.ip
  key: adminapikeyadminapikeyadminapikey
  version: 2 # optional, default is 1
```
