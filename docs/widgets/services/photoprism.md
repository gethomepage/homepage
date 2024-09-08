---
title: PhotoPrism
description: PhotoPrism Widget Configuration
---

Learn more about [PhotoPrism](https://github.com/photoprism/photoprism)..

Allowed fields: `["albums", "photos", "videos", "people"]`.

```yaml
widget:
  type: photoprism
  url: http://photoprism.host.or.ip:port
  username: admin
  password: password
```

If using app passwords, you can create one and specify that for authorization.

```yaml
widget:
  type: photoprism
  url: http://photoprism.host.or.ip:port
  authToken: <app password from Photoprism>
```
