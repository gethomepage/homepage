---
title: Guacamole
description: Guacamole Widget Configuration
---

Learn more about [Apache Guacamole](https://guacamole.apache.org/).

This widget shows the number of active sessions, total configured connections, and total users for a Guacamole server.

Use the username and password of an account that has permission to view connections and users on the data source you want to report on.

```yaml
widget:
  type: guacamole
  url: http://guacamole.host.or.ip:8080/guacamole
  username: guacadmin
  password: guacadminpassword
  datasource: mysql # optional
```

By default the widget uses the primary data source returned for the authenticated user. If your Guacamole instance has multiple data sources (e.g. multiple database or LDAP auth providers) and you want to report on a specific one, set the optional `datasource` field to its identifier, as configured in `guacamole.properties`.
