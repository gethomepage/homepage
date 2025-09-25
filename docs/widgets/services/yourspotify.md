---
title: Your Spotify
description: Your Spotify Widget Configuration
---

Learn more about [Your Spotify](https://github.com/Yooooomi/your_spotify).

Find your API key under `Settings > Account > Public token`, click `Generate` if not yet generated, copy key after
`?token=`.

Allowed fields: `["songs", "time", "artists"]`.

```yaml
widget:
  type: yourspotify
  url: http://your-spotify-server.host.or.ip # if using lsio image, add /api/
  key: apikeyapikeyapikeyapikeyapikey
  interval: month # optional, defaults to week
```

#### Interval

Allowed values for `interval`: `day`, `week`, `month`, `year`, `all`.

!!! note

    `interval` is different from predefined intervals you see in `Your Spotify`'s UI.
    For example, `This week` in UI means _from the start of this week_, here `week` means _past 7 days_.
