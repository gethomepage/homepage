---
title: Gotify
description: Gotify Widget Configuration
---

[Gotify](https://github.com/gotify/server) - A simple server for sending and receiving messages in real-time per WebSocket. (Includes a sleek web-ui)

Get a Gotify client token from an existing client or create a new one on your Gotify admin page.

Allowed fields: `["apps", "clients", "messages"]`.

```yaml
widget:
  type: gotify
  url: http://gotify.host.or.ip
  key: clientoken
```
