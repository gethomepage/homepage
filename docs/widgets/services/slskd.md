---
title: Slskd
description: Slskd Widget Configuration
---

Learn more about [Slskd](https://github.com/slskd/slskd).

Generate an API key for slskd with `openssl rand -base64 48`.
Add it to your `path/to/config/slskd.yml` in `web > authentication > api_keys`:

```yaml
homepage_widget:
  key: <generated key>
  role: readonly
  cidr: <homepage subnet>
```

Allowed fields: `["slskStatus", "updateStatus", "downloads", "uploads", "sharedFiles"]` (maximum of 4).

```yaml
widget:
  type: slskd
  url: http[s]://slskd.host.or.ip[:5030]
  key: generatedapikey
```
