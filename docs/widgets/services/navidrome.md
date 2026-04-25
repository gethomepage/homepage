---
title: Navidrome
description: Navidrome Widget Configuration
---

Learn more about [Navidrome](https://github.com/navidrome/navidrome).

For detailed information about Subsonic token authentication see http://www.subsonic.org/pages/api.jsp.

As of this version the widget supports library statistic blocks for `songs`, `albums`, and `artists`. These blocks are disabled by default and can be enabled with the `enableBlocks` option. "Now Playing" remains enabled by default and can be disabled with the `enableNowPlaying` option.

If you enable blocks, `password` is required because Navidrome's library API uses JWT-based authentication. If you provide `password`, Homepage can also use it for "Now Playing", so `token` and `salt` become optional.

```yaml
widget:
  type: navidrome
  url: http://navidrome.host.or.ip:port
  user: username
  password: password # optional, required for enableBlocks
  token: token # optional, md5(password + salt)
  salt: randomsalt # optional
  enableBlocks: true # optional, defaults to false
  enableNowPlaying: false # optional, defaults to true
```
