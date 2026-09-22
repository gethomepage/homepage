---
title: Custom API
description: Custom API Information Widget Configuration
---

_(Find the Custom API service widget [here](../services/customapi.md))_

The Custom API information widget shows values from a custom self-hosted or third party JSON API in
the header, alongside the other information widgets. Fields are picked out of the API response with
the same `mappings` syntax as the service widget, and each mapping is rendered as a value with its
label. You can have multiple instances by adding another configuration block.

```yaml
- customapi:
    url: http://custom.api.host.or.ip:port/path/to/exact/api/endpoint
    refreshInterval: 10000 # optional - in milliseconds, defaults to 10s
    username: username # auth - optional
    password: password # auth - optional
    method: GET # optional, e.g. POST
    headers: # optional, must be object
      X-API-Token: token
    requestBody: # optional, can be string or object
    label: My API # optional
    mappings:
      - field: key
        label: Field 1
        format: text # optional - defaults to text
      - field: path.to.key2
        label: Field 2
        format: float # optional - defaults to text
        suffix: "°C" # optional
        icon: mdi-thermometer # optional, same syntax as service icons
```

The request is made from the server, so `url`, `username`, `password`, `headers` and `requestBody`
are never sent to the browser.

Each mapping can carry an `icon`, using the same `mdi-`, `si-`, `sh-` or URL syntax as service icons.
A mapping without one renders as label and value only.

The `field` syntax, the supported formats (`text`, `number`, `float`, `percent`, `duration`,
`bytes`, `bitrate`, `size`, `date` and `relativeDate`) and the `remap`, `scale`, `prefix` and
`suffix` transformations are the same as for the [Custom API service widget](../services/customapi.md).
The `display` modes (`list`, `dynamic-list`) and `additionalField` are service widget options and
have no effect here.

## Example

Showing the one-minute load average from a Prometheus query against node_exporter:

```yaml
- customapi:
    url: http://prometheus:9090/api/v1/query?query=node_load1
    refreshInterval: 60000
    label: Server
    mappings:
      - field: data.result.0.value.1
        label: Load
        format: float
        icon: mdi-chip
```
