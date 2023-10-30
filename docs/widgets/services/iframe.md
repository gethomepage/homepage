---
title: iFrame
description: Add a custom iFrame Widget
---
name
Type: string
Description: Important to allow the iframe to be unique on the page and helps if you would like to target the iframe with a button

src
Type: string (URL)
Description: URL of the content to load within the iFrame

sizes
Type: object {"xs": '60', "sm": "60", "md": "80", "lg": "80", "xl": "80", "2xl": "80"}
Description: Controls the height of the iframe (width is always 100%) The value for each breakpoint size must map directly to a field in the Tailwind Height CSS classes - https://tailwindcss.com/docs/height

referrerpolicy
Type: string ["no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin-when-cross-origin" | "unsafe-url"]
Description: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy

allowfullscreen
Type: boolean [true | false]
Description: Controls whether you can interact with a fullscreen button from within the iframe content and have the content expand into fullscreen - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#allowfullscreen

loading
Type: string ["eager" | "lazy"]
Description: Changes the loading style of the iframe, delaying the loading until other assets are finished - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#loading

allowScrolling
Type: string ["yes" | "no"]
Description: Will disable scrolling and visible scrollbars. Deprecated, but still implemented by major browsers (for now) - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#scrolling

border
Type: number
Description: Will remove the small border present on some browsers. Deprecated, but still implemented by major browsers (for now) - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#frameborder

refreshInterval
Type: number (in milliseconds)
Description: This will refresh the iframe on an interval

allowPolicy
Type: string
Description: Allows you to control some of the permissions and functionality that is allowed within the iFrame content. You can combine as many directives from the following list into a single string separated by space characters - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy

```yaml
widget:
  type: iframe
  name: myIframe
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

