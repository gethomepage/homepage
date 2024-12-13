---
title: Transmission
description: Transmission Widget Configuration
---

Learn more about [Transmission](https://github.com/transmission/transmission).

Uses the same username and password used to login from the web.

Allowed fields: `["leech", "download", "seed", "upload"]`.

```yaml
widget:
  type: transmission
  url: http://transmission.host.or.ip
  username: username
  password: password
  rpcUrl: /transmission/ # Optional. Matches the value of "rpc-url" in your Transmission's settings.json file
```
