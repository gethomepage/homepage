---
title: Nginx Proxy Manager
description: Nginx Proxy Manager Widget Configuration
---

[Nginx Proxy Manager](https://nginxproxymanager.com/) - Docker container and built in Web Application for managing Nginx proxy hosts with a simple, powerful interface.

Login with the same admin username and password used to access the web UI.

Allowed fields: `["enabled", "disabled", "total"]`.

```yaml
widget:
  type: npm
  url: http://npm.host.or.ip
  username: admin_username
  password: admin_password
```
