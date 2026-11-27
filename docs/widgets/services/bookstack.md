---
title: BookStack
description: BookStack Widget Configuration
---

Learn more about [BookStack](https://www.bookstackapp.com/) and its [API documentation](https://demo.bookstackapp.com/api/docs).

The widget shows the number of shelves, books, chapters, and pages visible to the API token.

Create an API token for a user with the "Access System API" permission (in the user profile, under API Tokens). The widget authenticates with:

```
Authorization: Token <tokenId>:<tokenSecret>
```

It then calls `GET /api/shelves`, `/api/books`, `/api/chapters`, and `/api/pages` in parallel (with `count=1` to keep the payloads small) and displays each listing's `total`.

Allowed fields: `["shelves", "books", "chapters", "pages"]`.

```yaml
widget:
  type: bookstack
  url: https://bookstack.host.or.ip
  tokenId: tokenid
  tokenSecret: tokensecret
```
