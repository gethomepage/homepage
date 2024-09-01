---
title: Prayer Times
description: Islamic Prayer Times Widget Configuration
---

The Prayer Times widget displays Islamic prayer times using the `adhan-js` library based on your location.

### Configuration Options

- **`latitude` (required)**: Location latitude.
- **`longitude` (required)**: Location longitude.
- **`method` (optional)**: Prayer time calculation method. Defaults to `"UmmAlQura"`. Options include:
  - `"MuslimWorldLeague"`, `"Egyptian"`, `"Karachi"`, `"UmmAlQura"`, `"Dubai"`, `"MoonsightingCommittee"`, `"NorthAmerica"`, `"Kuwait"`, `"Qatar"`, `"Singapore"`, `"Turkey"`.
- **`text_size` (optional)**: Font size for prayer times. Defaults to `"lg"`. Options: `"4xl"`, `"3xl"`, `"2xl"`, `"xl"`, `"lg"`, `"md"`, `"sm"`, `"xs"`.

### Example Configuration

```yaml
- adhan:
    latitude: 24.774265
    longitude: 46.738586
    method: "MuslimWorldLeague"
    text_size: "lg"
```

### Default Method (`UmmAlQura`)

```yaml
- adhan:
    latitude: 21.4225
    longitude: 39.8262
    text_size: "xl"
```
