---
title: OliveTin
description: OliveTin Widget Configuration
---

Learn more about [OliveTin](https://www.olivetin.app/).

![image](https://github.com/sunnycloudy1337/homepage/assets/163424707/63ae4070-c614-4332-84cc-d275b62c47ee)

OliveTin gives safe and simple access to predefined shell commands from a web interface.

All actions must have an id specified that matches the one from the OliveTin configuration.

!!! note

    Currently there is no feedback after triggering an action.

```yaml
widget:
  type: olivetin
  url: http://olivetin.host.or.ip:port
  actions:
    - id: volume_down # Action id, from OliveTin (https://docs.olivetin.app/action-ids.html)
      label: 🔉
      class: text-xl # Optional, default is "font-thin text-sm"
    - id: volume_toggle
      label: 🔇
      class: text-xl
    - id: volume_up
      label: 🔊
      class: text-xl
```
