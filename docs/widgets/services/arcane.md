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
  version: 2 # optional, defaults to 1. Use 2 for Arcane v3.0.0 or later
  fields: ["running", "stopped", "total", "image_updates"] # optional
```

| Arcane Version | Homepage Widget Version |
| -------------- | ----------------------- |
| < v3.0.0       | 1 (default)             |
| >= v3.0.0      | 2                       |

Using an API key for the widget requires permissions for: `containers:list`, `images:list`, and (for `version: 1`) `image-updates:read` or (for `version: 2`) `image-updates:list`.
