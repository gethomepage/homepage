---
title: Whisparr
description: Whisparr Widget Configuration
---

Learn more about [Whisparr](https://github.com/Whisparr/Whisparr).

Find your API key under `Settings > General`.

Allowed fields: `["wanted", "queued", "series"]`.

A detailed queue listing is disabled by default, but can be enabled with the `enableQueue` option.

```yaml
widget:
  type: whisparr
  url: http://whisparr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  enableQueue: true # optional, defaults to false
```
