---
title: Karakeep
description: Karakeep Widget Configuration
---

Learn more about [Karakeep](https://karakeep.app) (formerly known as Hoarder).

Generate an API key for your user at `User Settings > API Keys`.

Allowed fields: `["bookmarks", "favorites", "archived", "highlights", "lists", "tags"]` (maximum of 4).

```yaml
widget:
  type: karakeep
  url: http[s]://karakeep.host.or.ip[:port]
  key: karakeep_api_key
```
