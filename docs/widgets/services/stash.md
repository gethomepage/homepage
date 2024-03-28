---
title: Stash
description: Stash Widget Configuration
---

Learn more about [Stash](https://github.com/stashapp/stash).

Find your API key from inside Stash at `Settings > Security > API Key`. Note that the API key is only required if your Stash instance has login credentials.

Allowed fields: `["scenes", "scenesPlayed", "playCount", "playDuration", "sceneSize", "sceneDuration", "images", "imageSize", "galleries", "performers", "studios", "movies", "tags", "oCount"]`.

If more than 4 fields are provided, only the first 4 are displayed.

```yaml
widget:
  type: stash
  url: http://stash.host.or.ip
  key: stashapikey
  fields: ["scenes", "images"] # optional - default fields shown
```
