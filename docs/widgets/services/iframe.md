---
title: iFrame
description: Add a custom iFrame Widget
---

Find your API key under `Settings > General`.

The value for each breakpoint in the Sizes field must map directly to a field in the Tailwind Height CSS classes - https://tailwindcss.com/docs/height

referrerpolicy="no-referrer|no-referrer-when-downgrade|origin|origin-when-cross-origin|same-origin|strict-origin-when-cross-origin|unsafe-url"

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy

https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy

allowfullscreen: true | false

loading: eager | lazy

allowScrolling: yes | no

```yaml
widget:
  type: iframe
  src: "http://example.com"
  sizes: {"xs": '60', "sm": "60", "md": "80", "lg": "80", "xl": "80", "2xl": "80"}
  referrerPolicy: "same-origin"
  allowPolicy: ""
  allowFullscreen: "false"
  loadingStrategy: "eager"
  allowScrolling: "no"
  allowTransparency: "false"
  allowAutoplay: "false"
  border: 0
  refreshInterval: 2000
```

