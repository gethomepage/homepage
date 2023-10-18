---
title: Kubernetes
description: Kubernetes Information Widget Configuration
---

This is very similar to the Resources widget, but provides resource information about a Kubernetes cluster.

It provides CPU and Memory usage, by node and/or at the cluster level.

```yaml
- kubernetes:
    cluster:
      # Shows cluster-wide statistics
      show: true
      # Shows the aggregate CPU stats
      cpu: true
      # Shows the aggregate memory stats
      memory: true
      # Shows a custom label
      showLabel: true
      label: "cluster"
    nodes:
      # Shows node-specific statistics
      show: true
      # Shows the CPU for each node
      cpu: true
      # Shows the memory for each node
      memory: true
      # Shows the label, which is always the node name
      showLabel: true
```
