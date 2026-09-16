---
title: Nginx Proxy Manager
description: Nginx Proxy Manager Widget Configuration
---

Learn more about [Nginx Proxy Manager](https://nginxproxymanager.com/).

Use a "view-only" user for the username and password.

Allowed fields: `["enabled", "disabled", "total"]`.

```yaml
widget:
  type: npm
  url: http://npm.host.or.ip
  username: view_only_username
  password: view_only_password
```
