---
title: Custom API
description: Custom API Information Widget Configuration
---

_(Find the Custom API service widget [here](../services/customapi.md))_

The Custom API information widget shows values from a custom self-hosted or third party API in your Homepage header, alongside an icon.

```yaml
- customapi:
    url: http://custom.api.host.or.ip:port/path/to/exact/api/endpoint
    icon: mdi-api # optional, see below
    href: https://custom.api.host # optional, makes the widget a link
    refreshInterval: 10000 # optional - in milliseconds, defaults to 10s
    username: username # auth - optional
    password: password # auth - optional
    method: GET # optional, e.g. POST
    headers: # optional, must be object
      X-API-Token: token
    requestBody: # optional, can be string or object
    mappings:
      - field: key
        label: Field 1
      - field: path.to.key2
        label: Field 2
        format: number # optional - defaults to text
      - field: path.to.key3
        label: Field 3
        format: percent
```

The `icon` accepts the same values as [service icons](../../configs/services.md#icons), e.g. `mdi-api`, `si-github`, `sh-homepage`, a dashboard icon name like `homepage.png`, or a full URL. If no icon is set, a generic API icon is shown.

Mappings support the same `field`, `format`, `remap`, `scale`, `prefix` and `suffix` options as the [Custom API service widget](../services/customapi.md). The `additionalField` option and the `display` modes are not supported.
