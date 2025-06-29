---
title: Peekaping
description: Peekaping Widget Configuration
---

Learn more about [Peekaping](https://github.com/0xfurai/peekaping).

Peekaping is a modern, self-hosted uptime monitoring solution built with Go and React. The widget uses data from a status page to display monitoring statistics. You'll need a status page configured with a group of monitored services to get the slug (the status page identifier).

Allowed fields: `["up", "down", "uptime", "avgResponse"]`.

```yaml
widget:
  type: peekaping
  url: http://peekaping.host.or.ip:port
  slug: your-status-page-slug
```
