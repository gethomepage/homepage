---
title: PhotoPrism
description: PhotoPrism Widget Configuration
---

Learn more about [PhotoPrism](https://github.com/photoprism/photoprism).

Authentication is possible via [app passwords](https://docs.photoprism.app/user-guide/settings/account/#apps-and-devices) or username/password.

Allowed fields: `["albums", "photos", "videos", "people"]`.

```yaml
widget:
  type: photoprism
  url: http://photoprism.host.or.ip:port
  username: admin # required only if using username/password
  password: password # required only if using username/password
  key: # required only if using app passwords
```
