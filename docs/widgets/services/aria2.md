---
title: Aria2
description: Aria2 Widget Configuration
---

Learn more about [Aria2](https://github.com/aria2/aria2).

Find your API key in aria2 configuration file `aria2c.conf`: `rpc-secret`.
To make it work, JSON RPC in Aria2 should be enabled.

Optionally, `jsonrpc` endpoint path could be adjusted via `endpoint` widget config.

```yaml
widget:
  type: aria2
  url: http://aria2.host.or.ip
  key: apikey
```
