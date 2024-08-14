---
title: DeveLanCacheUI
description: DeveLanCacheUI Widget Configuration
---

Learn more about [DeveLanCacheUI](https://github.com/devedse/DeveLanCacheUI_Backend).

```yaml
widget:
  type: develancacheui
  url: http://your.fileflows.host:port
```

Ensure you point this to the API and not the frontend. Example:

```yaml
    - DeveLanCacheUI:
        icon: /assets/icons/DeveLanCacheUI.png
        href: https://develancacheui.devedse.duckdns.org
        widget:
            type: develancacheui
            url: https://develancacheui_api.devedse.duckdns.org #Note _api here
```
