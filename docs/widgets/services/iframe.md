---
title: iFrame
Description: Add a custom iFrame Widget
---

A basic iFrame widget to show external content, see the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) for more details about some of the options.

!!! warning

    Requests made via the iFrame widget are inherently **not proxied** as they are made from the browser itself.

## Basic Example

```yaml
widget:
  type: iframe
  name: myIframe
  src: http://example.com
```

## Full Example

```yaml
widget:
  type: iframe
  name: myIframe
  src: http://example.com
  classes: h-60 sm:h-60 md:h-60 lg:h-60 xl:h-60 2xl:h-72 # optional, use tailwind height classes, see https://tailwindcss.com/docs/height
  referrerPolicy: same-origin # optional, no default
  allowPolicy: autoplay; fullscreen; gamepad # optional, no default
  allowFullscreen: false # optional, default: true
  loadingStrategy: eager # optional, default: eager
  allowScrolling: no # optional, default: yes
  refreshInterval: 2000 # optional, no default
```
