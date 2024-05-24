---
title: OpenWeatherMap
description: OpenWeatherMap Information Widget Configuration
---

The free tier "One Call API" is all that's required, you will need to [subscribe](https://home.openweathermap.org/subscriptions/unauth_subscribe/onecall_30/base) and grab your API key.

```yaml
- openweathermap:
    label: Kyiv #optional
    latitude: 50.449684
    longitude: 30.525026
    units: metric # or imperial
    provider: openweathermap
    apiKey: youropenweathermapkey # required only if not using provider, this reveals api key in requests
    cache: 5 # Time in minutes to cache API responses, to stay within limits
    format: # optional, Intl.NumberFormat options
      maximumFractionDigits: 1
```

You can optionally not pass a `latitude` and `longitude` and the widget will use your current location (requires a secure context, eg. HTTPS).
