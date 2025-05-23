---
title: Open WebUI
description: Open WebUI Widget Configuration
---

Learn more about [Open WebUI](https://docs.openwebui.com).

Shows user and models information.

Obtain your API key from Settings > Account in the Open WebUI, or alternatively, use a JWT (JSON Web Token) for authentication.

Allowed fields: `["users", "models"]`.

```yaml
widget:
  type: openwebui
  url: http://openwebui.host.or.ip:port
  key: api_token
```
