---
title: PeaNUT
description: PeaNUT Information Widget Configuration
---

_(Find the PeaNUT service widget [here](../services/peanut.md))_

The PeaNUT widget allows you to monitor your UPS device and is designed to match the `resources` info widget. You can have multiple instances by adding another configuration block.

```yaml
- peanut:
    url: http://peanut.host.or.ip:port # the URL of the PeaNUT server
    key: nameofyourups # the name of the device
    refresh: 3000 # optional, in ms
    label: My UPS # optional
    expanded: false # show the expanded view
```
