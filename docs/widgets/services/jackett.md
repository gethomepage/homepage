---
title: Jackett
description: Jackett Widget Configuration
---

Learn more about [Jackett](https://github.com/Jackett/Jackett).

Jackett must not have any authentication for the widget to work.

Allowed fields: `["configured", "errored"]`.

```yaml
widget:
  type: jackett
  url: http://jackett.host.or.ip
  key: jackettapikey
```
