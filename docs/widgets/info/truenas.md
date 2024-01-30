---
title: TrueNAS
description: TrueNAS Information Widget Configuration
---

_(Find the TrueNAS service widget [here](../services/truenas.md))_

The TrueNAS widget allows you to monitor the resources (CPU/memory) of your TrueNAS hosts, and is designed to match the `kubernetes` info widget. You can have multiple instances by adding another configuration block.

```yaml
- truenas:
    url: http://host.or.ip:port
    username: user # not required if using api key
    password: pass # not required if using api key
    key: yourtruenasapikey # not required if using username / password
    label: My TrueNAS # optional
    icon: si-truenas # optional, defaults to si-truenas
    refresh: 5000 # optional, in ms
```
