---
title: Plex
description: Plex Widget Configuration
---

Learn more about [Plex](https://www.plex.tv/).

The core Plex API is somewhat limited but basic info regarding library sizes and the number of active streams is supported. For more detailed info regarding active streams see the [Plex Tautulli widget](plex-tautulli.md).

Allowed fields: `["streams", "albums", "movies", "tv"]`.

```yaml
widget:
  type: plex
  url: http://plex.host.or.ip:32400
  key: mytokenhere # see https://www.plexopedia.com/plex-media-server/general/plex-token/
```
