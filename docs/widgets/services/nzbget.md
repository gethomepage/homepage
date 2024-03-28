---
title: NZBget
description: NZBget Widget Configuration
---

Learn more about [NZBget](https://github.com/nzbget/nzbget).

This widget uses the same authentication method as your browser when logging in (HTTP Basic Auth), and is often referred to as the ControlUsername and ControlPassword inside of Nzbget documentation.

Allowed fields: `["rate", "remaining", "downloaded"]`.

```yaml
widget:
  type: nzbget
  url: http://nzbget.host.or.ip
  username: controlusername
  password: controlpassword
```
