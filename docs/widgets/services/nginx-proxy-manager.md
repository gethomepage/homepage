---
title: Nginx Proxy Manager
description: Nginx Proxy Manager Widget Configuration
---

Learn more about [Nginx Proxy Manager](https://nginxproxymanager.com/).

Login with the same admin username and password used to access the web UI.

Allowed fields: `["enabled", "disabled", "total"]`.

```yaml
widget:
  type: npm
  url: http://npm.host.or.ip
  username: admin_username
  password: admin_password
```
