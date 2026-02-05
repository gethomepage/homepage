---
title: Arcane
description: Arcane Widget Configuration
---

Learn more about [Arcane](https://github.com/getarcaneapp/arcane).

`env` is required and should be your Arcane environment ID. If your environment ID is `0`, set it as a string (`"0"`).

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

Notes:

- `url` should be the Arcane base URL; the widget appends `/api`.
