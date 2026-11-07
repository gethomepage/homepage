---
title: Wiki.js
description: Wiki.js Widget Configuration
---

This widget displays page, user, and group totals from the Prometheus metrics exposed by Wiki.js.

```yaml
widget:
  type: wikijs
  url: http://wikijs.host.or.ip:3000
```

The widget requests the Wiki.js `/metrics` endpoint. It reads these metric names:

```text
wiki_pages_total 50
wiki_users_total 8
wiki_groups_total 3
```

The example values above are illustrative. The widget shows each metric as Pages, Users, and Groups. No API key is required for this metrics endpoint.

Wiki.js 2.x configurations that query `/graphql` do not work with Wiki.js 3.x, where GraphQL was removed. Use the `/metrics` endpoint instead.