---
title: Immich
description: Immich Widget Configuration
---

Learn more about [Immich](https://github.com/immich-app/immich).

| Immich Version | Homepage Widget Version |
| -------------- | ----------------------- |
| < v1.118       | 1                       |
| >= v1.118      | 2 (default)             |

Find your API key under `Account Settings > API Keys`. The key should have the
`server.statistics` permission.

Allowed fields: `["users" ,"photos", "videos", "storage"]`.

```yaml
widget:
  type: immich
  url: http://immich.host.or.ip
  key: adminapikeyadminapikeyadminapikey
  version: 1 # optional, default is 2. Use 1 only for Immich < v1.118
```
