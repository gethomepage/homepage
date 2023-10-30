---
title: iFrame
Description: Add a custom iFrame Widget
---

A basic iFrame widget to show external content, see the [MDN docs](ttps://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) for more details about some of the options.

!!! warning

    Requests made via the iFrame widget are inherently **not proxied** as they are made from the browser itself.

## Basic Example

```yaml
widget:
  type: iframe
  name: myIframe
  src: "http://example.com"
```

## Full Example

```yaml
widget:
  type: iframe
  name: myIframe
  src: "http://example.com"
  sizes: { "xs": "60", "sm": "60", "md": "80", "lg": "80", "xl": "80", "2xl": "80" } # optional - sets height of the iframe. The value for each breakpoint size must map directly to a field in the Tailwind Height CSS classes, see https://tailwindcss.com/docs/height
  referrerPolicy: "same-origin" # string - optional - no default
  allowPolicy: "autoplay fullscreen gamepad" # optional, no default
  allowFullscreen: false # optional, default: true
  loadingStrategy: "eager" # optional, default: "eager"
  allowScrolling: "no" # optional, default: "yes"
  border: 0 # optional, default: 1
  refreshInterval: 2000 # optional, no default
```
