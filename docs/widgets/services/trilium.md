---
title: Trilium
description: Trilium Widget Configuration
---

Learn more about [Trilium](https://github.com/TriliumNext/Notes).

This widget is compatible with [TriliumNext](https://github.com/TriliumNext/Notes) versions >= [v0.94.0](https://github.com/TriliumNext/Notes/releases/tag/v0.94.0).

Find (or create) your ETAPI key under `Options > ETAPI > Create new ETAPI token`.

Allowed fields: `["version", "notesCount", "dbSize"]`

```yaml
widget:
  type: trilium
  url: https://trilium.host.or.ip
  key: etapi_token
```
