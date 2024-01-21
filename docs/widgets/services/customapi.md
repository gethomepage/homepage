---
title: Custom API
description: Custom Widget Configuration from the API
---

This widget can show information from custom self-hosted or third party API.

Fields need to be defined in the `mappings` section YAML object to correlate with the value in the APIs JSON object. Final field definition needs to be the key with the desired value information.

```yaml
widget:
  type: customapi
  url: http://custom.api.host.or.ip:port/path/to/exact/api/endpoint
  refreshInterval: 10000 # optional - in milliseconds, defaults to 10s
  username: username # auth - optional
  password: password # auth - optional
  method: GET # optional, e.g. POST
  headers: # optional, must be object, see below
  mappings:
    - field: key # needs to be YAML string or object
      label: Field 1
      format: text # optional - defaults to text
    - field: # needs to be YAML string or object
        path:
          to: key2
      format: number # optional - defaults to text
      label: Field 2
    - field: # needs to be YAML string or object
        path:
          to:
            another: key3
      label: Field 3
      format: percent # optional - defaults to text
    - field: key # needs to be YAML string or object
      label: Field 4
      format: date # optional - defaults to text
      locale: nl # optional
      dateStyle: long # optional - defaults to "long". Allowed values: `["full", "long", "medium", "short"]`.
      timeStyle: medium # optional - Allowed values: `["full", "long", "medium", "short"]`.
    - field: key # needs to be YAML string or object
      label: Field 5
      format: relativeDate # optional - defaults to text
      locale: nl # optional
      style: short # optional - defaults to "long". Allowed values: `["long", "short", "narrow"]`.
      numeric: auto # optional - defaults to "always". Allowed values `["always", "auto"]`.
```

Supported formats for the values are `text`, `number`, `float`, `percent`, `bytes`, `bitrate`, `date` and `relativeDate`.

The `dateStyle` and `timeStyle` options of the `date` format are passed directly to [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) and the `style` and `numeric` options of `relativeDate` are passed to [Intl.RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat).

## Example

For the following JSON object from the API:

```json
{
  "id": 1,
  "name": "Rick Sanchez",
  "status": "Alive",
  "species": "Human",
  "gender": "Male",
  "origin": {
    "name": "Earth (C-137)"
  },
  "locations": [
    {
      "name": "Earth (C-137)"
    },
    {
      "name": "Citadel of Ricks"
    }
  ]
}
```

Define the `mappings` section as an array, for example:

```yaml
mappings:
  - field: name # Rick Sanchez
    label: Name
  - field: status # Alive
    label: Status
  - field:
      origin: name # Earth (C-137)
    label: Origin
  - field:
      locations:
        1: name # Citadel of Ricks
    label: Location
```

## Data Transformation

You can manipulate data with the following tools `remap`, `scale` and `suffix`, for example:

```yaml
- field: key4
  label: Field 4
  format: text
  remap:
    - value: 0
      to: None
    - value: 1
      to: Connected
    - any: true # will map all other values
      to: Unknown
- field: key5
  label: Power
  format: float
  scale: 0.001 # can be number or string e.g. 1/16
  suffix: kW
```

## Custom Headers

Pass custom headers using the `headers` option, for example:

```yaml
headers:
  X-API-Token: token
```
