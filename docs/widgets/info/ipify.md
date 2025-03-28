---
title: Ipify
description: Ipify Information Widget Configuration
---

This allows you to display the public IP of the machine using the free ipify API.

```yaml
- ipify:
    ipv6: true # Use if you want to obtain your IPv6 address, defaults to false returning IPv4
    cache: 5 # Time in minutes to cache the API response
```

With default configuration only, this information widget can be added with

```yaml
- ipify: {}
```
