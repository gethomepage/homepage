---
title: Immich
description: Immich Widget Configuration
---

Learn more about [Immich](https://github.com/immich-app/immich).

Find your API key under `Account Settings > API Keys`.

Allowed fields: `["users" ,"photos", "videos", "storage"]`.

Note that API key must be from admin user.

```yaml
widget:
  type: immich
  url: http://immich.host.or.ip
  key: adminapikeyadminapikeyadminapikey
```
