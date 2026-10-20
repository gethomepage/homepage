---
title: Thingport
description: Thingport Widget Configuration
---

Learn more about [Thingport](https://github.com/TautvydasDerzinskas/Thingport).

Create an API token on your Thingport profile page. The token is read-only, and the widget shows the library of the user who created it.

Allowed fields: `["models", "collections", "categories", "authors"]`.

Two optional listings can be shown below the fields, each linking to the model in Thingport:

- `models` lists models: `recent` (recently added), `viewed` (most viewed) or `printed` (most printed). It shows three by default; `maxModels` sets how many, up to 10. More than three takes one extra request to Thingport.
- `featured` shows Thingport's model of the day.

The fields can be hidden with `enableBlocks: false` to show only the listings.

```yaml
widget:
  type: thingport
  url: http://thingport.host.or.ip:port
  key: thingportapitoken
  models: recent # optional - recent, viewed or printed
  maxModels: 5 # optional, defaults to 3, at most 10
  featured: true # optional, defaults to false
  enableBlocks: false # optional, defaults to true
```
