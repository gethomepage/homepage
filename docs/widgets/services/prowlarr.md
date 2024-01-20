---
title: Prowlarr
description: Prowlarr Widget Configuration
---

[Prowlarr](https://github.com/Prowlarr/Prowlarr) - Prowlarr is an indexer manager/proxy built on the popular *arr .net/reactjs base stack to integrate with your various PVR apps.

Find your API key under `Settings > General`.

Allowed fields: `["numberOfGrabs", "numberOfQueries", "numberOfFailGrabs", "numberOfFailQueries"]`.

```yaml
widget:
  type: prowlarr
  url: http://prowlarr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
```
