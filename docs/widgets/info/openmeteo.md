---
title: Open-Meteo
description: Open-Meteo Information Widget Configuration
---

No registration is required at all! See [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)

```yaml
- openmeteo:
    label: Kyiv # optional
    latitude: 50.449684
    longitude: 30.525026
    timezone: Europe/Kiev # optional
    units: metric # or imperial
    cache: 5 # Time in minutes to cache API responses, to stay within limits
    format: # optional, Intl.NumberFormat options
      maximumFractionDigits: 1
```

You can optionally not pass a `latitude` and `longitude` and the widget will use your current location (requires a secure context, eg. HTTPS).
