---
title: Tvheadend
description: Tvheadend Widget Configuration
---

Shows the status of the DVR feature (upcoming, finished, failed recordings) as well as a list of active subscriptions.

Learn more about [Tvheadend](https://tvheadend.org/).

Allowed fields: `["upcoming", "finished", "failed"]`.

```yaml
widget:
  type: tvheadend
  url: http://tvheadend.host.or.ip
  username: user
  password: pass
  fields: ["upcoming", "finished", "failed"]
```
