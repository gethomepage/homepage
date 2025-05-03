---
title: Jellystat
description: Jellystat Widget Configuration
---

Learn more about [Jellystat](https://github.com/CyferShepard/Jellystat). The widget supports (at least) Jellystat version 1.1.6

You can create an API key from inside Jellystat at `Settings > API Key`.

Allowed fields: `["songs", "movies", "episodes", "other"]`.

```yaml
widget:
  type: jellystat
  url: http://jellystat.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  days: 30 # optional, defaults to 30
```
