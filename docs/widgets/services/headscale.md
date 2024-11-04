---
title: Headscale
description: Headscale Widget Configuration
---

Learn more about [Headscale](https://headscale.net/).

You will need to generate an API access token from the [command line](https://headscale.net/ref/remote-cli/) using `headscale apikeys create` command.

To find your node ID, you can use `headscale nodes list` command.

Allowed fields: `["name", "address", "last_seen", "online"]`.

```yaml
widget:
  type: headscale
  nodeId: nodeid
  key: headscaleapiaccesstoken
```
