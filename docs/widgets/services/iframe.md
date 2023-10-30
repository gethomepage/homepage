---
title: iFrame
Description: Add a custom iFrame Widget
---

### name

**Type:** string <br>
**Default:** null <br>
**Required:** Yes <br>
**Description:** Important to allow the iframe to be unique on the page and helps if you would like to target the iframe with a button <br>
**Example:** "myIframe"

### src

**Type:** string (URL) <br>
**Default:** null <br>
**Required:** Yes <br>
**Description:** URL of the content to load within the iFrame <br>
**Example:** "http://example.com"

### sizes

**Type:** object <br>
**Default:** {"xs": '60', "sm": "60", "md": "80", "lg": "80", "xl": "80", "2xl": "80"} <br>
**Required:** No <br>
**Description:** Controls the height of the iframe (width is always 100%) The value for each breakpoint size must map directly to a field in the Tailwind Height CSS classes - [Tailwind Docs](https://tailwindcss.com/docs/height) <br>
**Example:** "{"xs": '32', "sm": "12", "md": "44", "lg": "60", "xl": "72", "2xl": "80"}"

### referrerpolicy

**Type:** string ["no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin-when-cross-origin" | "unsafe-url"] <br>
**Default:** null <br>
**Required:** No <br>
**Description:** [MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) <br>
**Example:** "no-referrer"

### allowfullscreen

**Type:** boolean [true | false] <br>
**Default:** null <br>
**Required:** No <br>
**Description:** Controls whether you can interact with a fullscreen button from within the iframe content and have the content expand into fullscreen - [MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#allowfullscreen) <br>
**Example:** false

### loading

**Type:** string ["eager" | "lazy"] <br>
**Default:** null <br>
**Required:** No <br>
**Description:** Changes the loading style of the iframe, delaying the loading until other assets are finished - [MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#loading) <br>
**Example:** "lazy"

### allowScrolling

**Type:** string ["yes" | "no"] <br>
**Default:** null <br>
**Required:** No <br>
**Description:** Will disable scrolling and visible scrollbars. Deprecated, but still implemented by major browsers (for now) - [MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#scrolling) <br>
**Example:** "no"

### border

**Type:** number <br>
**Default:** null <br>
**Required:** No <br>
**Description:** Will remove the small border present on some browsers. Deprecated, but still implemented by major browsers (for now) - [MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#frameborder) <br>
**Example:** 2

### refreshInterval

**Type:** number (in milliseconds) <br>
**Default:** null <br>
**Required:** No <br>
**Description:** This will refresh the iframe on an interval<br>
**Example:** 2000

### allowPolicy

**Type:** string <br>
**Default:** null <br>
**Required:** No <br>
**Description:** Allows you to control some of the permissions and functionality that is allowed within the iFrame content. You can combine as many directives from the following list into a single string separated by space characters - [MSDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy) <br>
**Example:** "autoplay fullscreen gamepad"

```yaml
widget:
  type: iframe
  name: myIframe
  src: "http://example.com"
  sizes: { "xs": "60", "sm": "60", "md": "80", "lg": "80", "xl": "80", "2xl": "80" }
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
