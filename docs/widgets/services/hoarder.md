---
title: Hoarder
description: Hoarder Widget Configuration
---

Learn more about [Hoarder](https://hoarder.app).

Generate an API key for your user at `User Settings > API Keys`.

Allowed fields: `["bookmarks", "favorites", "archived", "highlights", "lists", "tags"]` (maximum of 4).

```yaml
widget:
  type: hoarder
  url: http[s]://hoarder.host.or.ip[:port]
  key: hoarderapikey
```
