---
title: Netbird
description: Netbird Widget Configuration
---

Learn more about [Netbird](https://netbird.io/).

This widget connects to a self-hosted Netbird management instance using the Netbird Management API.

You will need to generate an API access token from the Netbird dashboard under **User settings &rarr; Access Tokens**. The token is sent to the API as an `Authorization: Token {key}` header.

```yaml
widget:
  type: netbird
  url: https://netbird.example.com
  key: your-netbird-api-token
```
