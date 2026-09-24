---
title: DDNS-Updater
description: DDNS-Updater Widget Configuration
---

Learn more about [DDNS-Updater](https://github.com/qdm12/ddns-updater).

Basic widget to show a few fields from the ddns-updater.

Allowed fields: `["domain", "provider", "status", "currentIP", "timeSinceLastUpdate", "previousIP"]`

Default fields: `["status", "timeSinceLastUpdate", "currentIP", "previousIP"]`

```yaml
widget:
  type: ddnsupdater
  url: http://ddns-updater.host.or.ip:port
  domain: domain # e.g. domain.duckdns.org
```
