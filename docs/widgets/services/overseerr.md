---
title: Overseerr
description: Overseerr Widget Configuration
---

Learn more about [Overseerr](https://github.com/sct/overseerr).

Find your API key under `Settings > General`.

Allowed fields: `["pending", "approved", "available", "processing"]`.

```yaml
widget:
  type: overseerr
  url: http://overseerr.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  pendingRequests: # optional, must be object, see below
    manageRequests: true # optional, defaults to false
    showImage: true # optional, defaults to false
    showReleaseYear: true # options, defaults to false
```

## Pending Requests

You can enable the ability to see and manage your pending requests on Overseerr using `pendingRequests` with the options below.

`manageRequests`: When set to `true` it displays two buttons for each request to approve or deny the request.

`showImage`: When set to `true` it displays a small image of the show/movie poster and makes the request panel larger.

`showReleaseYear`: When set to `true` it shows the release year in parenthesis after the show/movie title.
