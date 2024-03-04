---
title: Crowdsec
description: Crowdsec Widget Configuration
---

Learn more about [Crowdsec](https://crowdsec.net).

Get your API key by registering a bouncer with your instance, see the [Crowdsec docs](https://docs.crowdsec.net/docs/local_api/intro#bouncers).

Allowed fields: ["totalDecisions", "activeBans"]

```yaml
widget:
  type: crowdsec
  url: http://crowdsechostorip:port
  key: yourcrowdsecbouncerkey
```
