---
title: Ceph
description: Ceph Widget Configuration
---

Learn more about [Ceph API](https://docs.ceph.com/en/latest/api/).

The username and password are the same as used to login to the web interface.

Allowed fields: `["status", "alerts", "freespace", "usedspace", "free", "used", "read", "write", "recovering"]`.


```yaml
widget:
  type: ceph
  url: http://ceph.host.or.ip:port
  username: user1
  password: password1
  fields: ["status", "alerts", "used"]
```
