---
title: Twingate
description: Twingate Widget Configuration
---

Learn more about [Twingate](https://www.twingate.com/).

You will need to generate an API key from the [API settings](https://amagi.twingate.com/settings/api) on the Twingate settings dashboard.

For URL use your network subdomain like - `https://<NETWORK_NAME>.twingate.com`

Allowed fields: `["networks", "devices", "resources", "users", "groups", "connectors"]`.

```yaml
widget:
  type: twingate
  url: https://amagi.twingate.com
  key: <API_KEY generated from above step>
  fields: ["networks", "devices", "resources", "users", "groups", "connectors"]
```
