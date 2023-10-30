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
  name: myIframe # string - required - Also helps if you would like to target the iframe with a button
  src: "http://example.com" # string - required - URL of the content to load within the iFrame
  classes: "h-60 sm:h-60 md:h-60 lg:h-60 xl:h-60 2xl:h-72 w-full rounded" # string - optional - Apply any tailwind height, rounding or width classes you would like
  referrerPolicy: "same-origin" # string - optional - no default
  allowPolicy: "autoplay fullscreen gamepad" # optional, no default
  allowFullscreen: false # optional, default: true
  loadingStrategy: "eager" # optional, default: "eager"
  allowScrolling: "no" # optional, default: "yes"
  border: 0 # optional, default: 1
  refreshInterval: 2000 # optional, no default
```
