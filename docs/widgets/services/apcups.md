---
title: APC UPS Monitoring
description: Lightweight monitoring widget for APC UPSs using apcupsd daemon
---

This widget extracts UPS information from an apcupsd daemon.
Only works for [APC/Schneider](https://www.se.com/us/en/product-range/61915-smartups/#products) UPS products.

[!NOTE]
By default apcupsd daemon is bound to 127.0.0.1. Edit `/etc/apcupsd.conf` and change `NISIP` to an IP accessible from your homepage docker (usually your internal LAN interface).

```yaml
widget:
  type: apcups
  url: tcp://your.acpupsd.host:3551
```
