---
title: Search
description: Search Information Widget Configuration
---

You can add a search bar to your top widget area that can search using Google, Duckduckgo, Bing, Baidu, Brave or any other custom provider that supports the basic `?q=` search query param.

```yaml
- search:
    provider: google # google, duckduckgo, bing, baidu, brave or custom
    focus: true # Optional, will set focus to the search bar on page load
    target: _blank # One of _self, _blank, _parent or _top
```

or for a custom search:

```yaml
- search:
    provider: custom
    url: https://lougle.com/?q=
    target: _blank
```

multiple providers is also supported via a dropdown (excluding custom):

```yaml
- search:
    provider: [brave, google, duckduckgo]
```

_Added in v0.1.6, updated in 0.6.0_
