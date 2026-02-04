---
title: Arcane
description: Arcane Widget Configuration
---

This widget pulls container, image, and update counts from the Arcane API.

`env` is required and should be your Arcane environment ID. If your environment ID is `0`, set it as a string (`"0"`).

**Allowed fields** (max 4): `running`, `stopped`, `total`, `images`, `images_used`, `images_unused`, `image_updates`.
**Default fields**: `running`, `stopped`, `total`, `image_updates`.

```yaml
widget:
  type: arcane
  url: http://localhost:3552
  env: "0" # default local environment
  key: your-api-key
  fields: ["running", "stopped", "total", "image_updates"] # optional
```

Notes:

- `url` should be the Arcane base URL; the widget appends `/api`.
