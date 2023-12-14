---
title: Longhorn
description: Longhorn Storage Widget Configuration
---

The Longhorn widget pulls storage utilization metrics from the Longhorn storage driver on Kubernetes.
It is designed to appear similar to the Resource widget's disk representation.

The exact metrics should be very similar to what is seen on the Longhorn dashboard itself.

It can show the aggregate metrics and/or the individual node metrics.

```yaml
- longhorn:
    # Show the expanded view
    expanded: true
    # Shows a node representing the aggregate values
    total: true
    # Shows the node names as labels
    labels: true
    # Show the nodes
    nodes: true
    # An explicit list of nodes to show. All are shown by default if "nodes" is true
    include:
      - node1
      - node2
```

The Longhorn URL and credentials are stored in the `providers` section of the `settings.yaml`. e.g.:

```yaml
providers:
  longhorn:
    username: "longhorn-username" # optional
    password: "very-secret-longhorn-password" # optional
    url: https://longhorn.aesop.network
```
