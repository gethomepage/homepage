---
title: Duplicati
description: Duplicati Widget Configuration
---

[Duplicati](https://www.duplicati.com/) is a self-hosted backup client.

This widget logs in with the normal Duplicati UI password on every refresh. It does not require a forever JWT token.

Allowed fields: `["jobs", "stored", "lastBackup", "nextRun", "running", "warnings", "errors"]`

Default fields: `["jobs", "errors", "lastBackup", "nextRun"]`

```yaml
widget:
  type: duplicati
  url: http://duplicati.host.or.ip:8200
  password: your_duplicati_ui_password
  fields: ["jobs", "errors", "lastBackup", "nextRun"] # optional
```
