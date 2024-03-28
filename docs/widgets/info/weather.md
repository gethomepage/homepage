---
title: Weather API
description: Weather API Information Widget Configuration
---

**Note: this widget is considered 'deprecated' since there is no longer a free Weather API tier for new members. See the openmeteo or openweathermap widgets for alternatives.**

The free tier is all that's required, you will need to [register](https://www.weatherapi.com/signup.aspx) and grab your API key.

```yaml
- weatherapi:
    label: Kyiv # optional
    latitude: 50.449684
    longitude: 30.525026
    units: metric # or imperial
    apiKey: yourweatherapikey
    cache: 5 # Time in minutes to cache API responses, to stay within limits
    format: # optional, Intl.NumberFormat options
      maximumFractionDigits: 1
```

You can optionally not pass a `latitude` and `longitude` and the widget will use your current location (requires a secure context, eg. HTTPS).
