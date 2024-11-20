---
title: Garage
description: Garage Widget Configuration
---

Learn more about [Garage](https://git.deuxfleurs.fr/Deuxfleurs/garage).

Use the admin token key. Information about the token can be found in the [Garage configuration file documentation](https://garagehq.deuxfleurs.fr/documentation/reference-manual/configuration/).

Allowed fields: `["status", "knownNodes", "connectedNodes", "storageNodes", "storageNodesOk", "partitions", "partitionsQuorum", "partitionsAllOk"]`.

```yaml
widget:
  type: garage
  url: http://garage.host.or.ip:port
  key: token
```
