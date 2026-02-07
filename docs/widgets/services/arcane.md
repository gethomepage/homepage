---
title: Arcane
description: Arcane Widget Configuration
---

Learn more about [Arcane](https://github.com/getarcaneapp/arcane).

**Allowed fields** (max 4): `running`, `stopped`, `total`, `images`, `images_used`, `images_unused`, `image_updates`.
**Default fields**: `running`, `stopped`, `total`, `image_updates`.

```yaml
widget:
  type: arcane
  url: http://localhost:3552
  env: 0 # required, 0 is Arcane default local environment
  key: your-api-key
  fields: ["running", "stopped", "total", "image_updates"] # optional
```
