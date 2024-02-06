---
title: Audiobookshelf
description: Audiobookshelf Widget Configuration
---

Learn more about [Audiobookshelf](https://github.com/advplyr/audiobookshelf).

You can find your API token by logging into the Audiobookshelf web app as an admin, go to the config → users page, and click on your account.

Allowed fields: `["podcasts", "podcastsDuration", "books", "booksDuration"]`

```yaml
widget:
  type: audiobookshelf
  url: http://audiobookshelf.host.or.ip:port
  key: audiobookshelflapikey
```
