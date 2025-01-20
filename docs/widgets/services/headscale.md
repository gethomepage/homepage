---
title: Headscale
description: Headscale Widget Configuration
---

Learn more about [Headscale](https://headscale.net/).

You will need to generate an API access token from the [command line](https://headscale.net/ref/remote-cli/#create-an-api-key) using `headscale apikeys create` command.

To find your node ID, you can use `headscale nodes list` command.

Allowed fields: `["name", "address", "last_seen", "status"]`.

```yaml
widget:
  type: headscale
  url: http://headscale.host.or.ip:port
  nodeId: nodeid
  key: headscaleapiaccesstoken
```
