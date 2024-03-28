---
title: Search
description: Search Information Widget Configuration
---

You can add a search bar to your top widget area that can search using Google, Duckduckgo, Bing, Baidu, Brave or any other custom provider that supports the basic `?q=` search query param.

```yaml
- search:
    provider: google # google, duckduckgo, bing, baidu, brave or custom
    focus: true # Optional, will set focus to the search bar on page load
    showSearchSuggestions: true # Optional, will show search suggestions. Defaults to false
    target: _blank # One of _self, _blank, _parent or _top
```

or for a custom search:

```yaml
- search:
    provider: custom
    url: https://www.ecosia.org/search?q=
    target: _blank
    suggestionUrl: https://ac.ecosia.org/autocomplete?type=list&q= # Optional
    showSearchSuggestions: true # Optional
```

multiple providers is also supported via a dropdown (excluding custom):

```yaml
- search:
    provider: [brave, google, duckduckgo]
```

The response body for the URL provided with the `suggestionUrl` option should look like this:

```json
[
  "home",
  [
    "home depot",
    "home depot near me",
    "home equity loan",
    "homeworkify",
    "homedepot.com",
    "homebase login",
    "home depot credit card",
    "home goods"
  ]
]
```

The first entry of the array contains the search query, the second one is an array of the suggestions.
In the example above, the search query was **home**.

_Added in v0.1.6, updated in 0.6.0_
