---
title: Navidrome
description: Navidrome Widget Configuration
---

Learn more about [Navidrome](https://github.com/navidrome/navidrome).

For detailed information about how to generate the token see http://www.subsonic.org/pages/api.jsp.

Displayed fields: now playing entries plus library counts for `artists`, `albums`, `songs`, and `playlists`.

The displayed fields are not configurable. The library counts use Navidrome's Subsonic-compatible API and may depend on the server returning compatible artist, album, scan status, and playlist responses.

```yaml
widget:
  type: navidrome
  url: http://navidrome.host.or.ip:port
  user: username
  token: token #md5(password + salt)
  salt: randomsalt
```
