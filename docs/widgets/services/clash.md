---
title: Clash
description: Clash Widget Configuration
---

Learn more about the [Clash RESTful API](https://wiki.metacubex.one/api/).

This widget talks to the Clash RESTful API, so it works with any Clash-compatible core — including mihomo (formerly Clash Meta), the core used by OpenClash on OpenWrt. Point it at the external controller (port `9090` by default) and provide the API secret if one is configured. The API secret is the `secret` field of the running core config.

Allowed fields: `["mode", "active", "up", "down", "connections", "latency", "version"]`.
Default fields: `["mode", "active", "up", "down"]`.

The `active` field shows the node currently selected in a strategy group. By default the `GLOBAL` group is used; set `group` to any Selector / URLTest / Fallback group name in your config to watch that group instead.

- `up` / `down` show the cumulative upload/download totals since the core started.
- `connections` shows the number of active connections.
- `latency` shows the last known delay of the active node, taken from the core's proxy history — it is read-only and does not trigger any latency tests.
- `version` shows the core version string.

```yaml
widget:
  type: clash
  url: http://clash.host.or.ip:9090
  key: apisecret # optional, only required if the API has a secret
  group: PROXY # optional, strategy group to show the current selection for, default is GLOBAL
  fields: [mode, active, up, down] # optional, defaults to all four
```
