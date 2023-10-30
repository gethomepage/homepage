---
title: iFrame
Description: Add a custom iFrame Widget
---

## Basic Example

```yaml
widget:
  type: iframe
  name: myIframe # string - required - Also helps if you would like to target the iframe with a button
  src: "http://example.com" # string - required - URL of the content to load within the iFrame
```

## Full Example

```yaml
widget:
  type: iframe
  name: myIframe # string - required - Also helps if you would like to target the iframe with a button
  src: "http://example.com" # string - required - URL of the content to load within the iFrame
  sizes: {
      "xs": "60",
      "sm": "60",
      "md": "80",
      "lg": "80",
      "xl": "80",
      "2xl": "80",
    } # optional - Controls the height of the iframe (width is always 100%) The value for each breakpoint size must map directly to a field in the Tailwind Height CSS classes
  referrerPolicy: "same-origin" # string - optional - no default
  allowPolicy: "autoplay fullscreen gamepad" # string - optional - no default - Control the permissions for the iFrame content
  allowFullscreen: false # boolean - optional - default: true - Controls whether you can interact with a fullscreen button from within the iframe content and have the content expand into fullscreen
  loadingStrategy: "eager" # string - optional - default: "eager" - Make the iframe lazy load
  allowScrolling: "no" # string - optional - default: "yes" - Will disable scrolling and visible scrollbars. Deprecated, but still implemented by major browsers (for now)
  border: 0 # number - optional - default: 1 - Will remove the small border present on some browsers. Deprecated, but still implemented by major browsers (for now)
  refreshInterval: 2000 # number - optional - no default - This will refresh the iframe on an interval
```

### Available Sizes

[Tailwind Docs](https://tailwindcss.com/docs/height)

### References

[referrerPolicy MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) <br>
[allowFullscreen MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#allowfullscreen) <br>
[loading MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#loading) <br>
[scrolling MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#scrolling) <br>
[border MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#frameborder) <br>
[allowPolicy MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)
