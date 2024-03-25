---
title: Crowdsec
description: Crowdsec Widget Configuration
---

Learn more about [Crowdsec](https://crowdsec.net).

See the [crowdsec docs](https://docs.crowdsec.net/docs/local_api/intro/#machines) for information about registering a machine,
in most instances you can use the default credentials (`/etc/crowdsec/local_api_credentials.yaml`).

Allowed fields: ["alerts", "bans"]

```yaml
widget:
  type: crowdsec
  url: http://crowdsechostorip:port
  username: localhost # machine_id in crowdsec
  passowrd: password
```
