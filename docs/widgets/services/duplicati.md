---
title: Duplicati
description: Duplicati Widget Configuration
---

Learn more about [Duplicati](https://www.duplicati.com/).

Allowed fields: `["jobs", "stored", "lastBackup", "nextRun", "running", "warnings", "errors"]`

Default fields: `["jobs", "errors", "lastBackup", "nextRun"]`

```yaml
widget:
  type: duplicati
  url: http://duplicati.host.or.ip:8200
  password: your_duplicati_ui_password
  fields: ["jobs", "errors", "lastBackup", "nextRun"] # optional
```
