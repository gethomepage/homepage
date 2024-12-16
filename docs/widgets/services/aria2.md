---
title: Aria2
description: Aria2 Widget Configuration
---

Learn more about [Aria2](https://github.com/aria2/aria2).

Find your API key in aria2c configuration file `aria2c.conf`: `rpc-secret`.
To make it work, JSON RPC in Aria2 should be enabled.

Optionally, `jsonrpc` endpoint path could be adjusted via `endpoint` widget config.

```yaml
widget:
  type: aria2c
  url: http://aria2c.host.or.ip
  key: apikey
```
