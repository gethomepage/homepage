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

## Arcane manager V2.\*

If you moved to Arcane manager V2.\* the authorization for the API keys has changed.

you will need the following permissions:

- **containers:list** for `running`, `stopped`, `total`
- **images:list** for `images`, `images_used`, `images_unused`, `image_updates`
- **image-updates:read** for `image_updates`

You can also edit the permissions on the existing key instead of generating a new one.
