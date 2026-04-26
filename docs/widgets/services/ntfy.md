---
title: ntfy
description: ntfy Widget Configuration
---

Learn more about [ntfy](https://github.com/binwiederhier/ntfy).

This widget shows the latest notification for a ntfy topic, including the title or body, priority level, and when it was received. Works with both self-hosted ntfy instances and the public [ntfy.sh](https://ntfy.sh) service.

Allowed fields: `["title", "message", "priority", "lastReceived", "tags"]`.

Default fields: `["title", "message", "priority", "lastReceived"]`.

If more than 4 fields are provided, only the first 4 are displayed.

## Authentication

ntfy supports both public and private topics. For private instances or access-controlled topics, you can authenticate using either a **Bearer token** (ntfy access token) or **Basic auth** (username/password).

| Auth Method  | Config Fields                  | Notes                             |
| ------------ | ------------------------------ | --------------------------------- |
| None         | _(omit key/username/password)_ | For public topics                 |
| Bearer token | `key`                          | ntfy access tokens (`tk_` prefix) |
| Basic auth   | `username` + `password`        | Username/password credentials     |

See the [ntfy documentation](https://docs.ntfy.sh/config/#access-control) for details on access control.

```yaml
widget:
  type: ntfy
  url: http://ntfy.host.or.ip:port # required
  topic: mytopic # required
  # key: tk_accesstoken # optional — for token auth
  # username: user # optional — for basic auth
  # password: pass # optional — for basic auth
```
