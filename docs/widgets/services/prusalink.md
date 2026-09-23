---
title: PrusaLink
description: PrusaLink Widget Configuration
---

Monitor your printer using its local [PrusaLink API](https://github.com/prusa3d/Prusa-Link-Web/blob/master/spec/openapi.yaml).
Requires a PrusaLink version that supports `/api/v1/status` and API-key authentication.

Allowed fields: `["state", "progress", "time_left"]`.

```yaml
widget:
  type: prusalink
  url: http://printer.host.or.ip
  key: your_prusalink_api_key
```

Use the local PrusaLink API key, not a Prusa Connect cloud key. Enable API-key access if disabled in your PrusaLink installation.
The key is sent as an `X-Api-Key` header. HTTP Digest authentication is not supported by this widget.
See [PrusaLink troubleshooting](https://help.prusa3d.com/article/prusalink-troubleshooting_304411) for authentication details.

Time left uses the job’s `time_remaining` value in seconds and is displayed as a formatted duration, or `-` when unavailable.

Progress is shown as a percentage, or `-` when no job progress is available.

A Prusa-inspired printer icon is included at `/icons/prusalink.svg`. Set the icon on the service:

```yaml
- Prusa:
    icon: /icons/prusalink.svg
    href: http://printer.host.or.ip
    widget:
      type: prusalink
      url: http://printer.host.or.ip
      key: your_prusalink_api_key
```
