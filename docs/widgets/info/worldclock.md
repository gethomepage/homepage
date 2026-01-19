---
title: World Clock
description: World Clock Information Widget Configuration
---

Display multiple time zones with customizable labels and optional flag emojis. Ideal for monitoring times across different locations.

```yaml
- worldclock:
    clocks:
      - timezone: America/New_York
        label: NYC
      - timezone: Europe/London
        label: LON
      - timezone: Asia/Tokyo
        label: TYO
```

## Full Configuration

```yaml
- worldclock:
    text_size: sm # 4xl, 3xl, 2xl, xl, lg, md, sm, xs
    format: 24h # 24h or 12h
    locale: de # Override locale for date/time formatting
    layout: grid # horizontal, vertical, or grid
    columns: 4 # Columns for grid layout (1-8)
    show_date: true # Show date (first clock's timezone)
    date_position: left # Date position: left, right, above, below
    date_format: # Intl.DateTimeFormat options for date display
      weekday: short
      day: numeric
      month: short
    show_seconds: false # Include seconds in time display
    label_bold: true # Display label in bold
    time_bold: false # Display time in bold
    clocks:
      - timezone: Europe/Berlin
        label: DE
        flag: de # ISO 3166-1 alpha-2 country code for flag emoji
      - timezone: Asia/Dubai
        label: UAE
        flag: ae
      - timezone: America/Los_Angeles
        label: LA
        flag: us
```

## Options

| Option          | Type    | Default                | Description                                                                                                                                  |
| --------------- | ------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `text_size`     | string  | `sm`                   | Size of time text: `4xl`, `3xl`, `2xl`, `xl`, `lg`, `md`, `sm`, `xs`                                                                         |
| `format`        | string  | `24h`                  | Time format: `24h` or `12h`                                                                                                                  |
| `show_date`     | boolean | `false`                | Display date using first clock's timezone                                                                                                    |
| `date_position` | string  | `above`                | Date position: `left`, `right`, `above`, `below`                                                                                             |
| `show_seconds`  | boolean | `false`                | Include seconds in time display                                                                                                              |
| `layout`        | string  | `horizontal`           | Display layout: `horizontal`, `vertical`, or `grid`                                                                                          |
| `columns`       | number  | `2`                    | Number of columns for grid layout (1-8)                                                                                                      |
| `locale`        | string  | browser locale         | Override locale for formatting                                                                                                               |
| `date_format`   | object  | `{dateStyle: "short"}` | [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) options for date |
| `label_bold`    | boolean | `true`                 | Display label in bold                                                                                                                        |
| `time_bold`     | boolean | `false`                | Display time in bold                                                                                                                         |
| `clocks`        | array   | `[]`                   | Array of clock configurations                                                                                                                |

## Clock Configuration

| Option     | Type   | Required | Description                                               |
| ---------- | ------ | -------- | --------------------------------------------------------- |
| `timezone` | string | Yes      | IANA timezone (e.g., `Europe/Berlin`, `America/New_York`) |
| `label`    | string | No       | Display label                                             |
| `flag`     | string | No       | ISO 3166-1 alpha-2 country code for flag emoji            |

## Examples

### Horizontal Layout (Default)

```yaml
- worldclock:
    format: 12h
    clocks:
      - timezone: America/New_York
        label: New York
        flag: us
      - timezone: Europe/Paris
        label: Paris
        flag: fr
```

### Vertical Layout

```yaml
- worldclock:
    layout: vertical
    show_date: true
    clocks:
      - timezone: Asia/Tokyo
        label: Tokyo
        flag: jp
      - timezone: Australia/Sydney
        label: Sydney
        flag: au
```

### Office Locations

```yaml
- worldclock:
    text_size: md
    format: 24h
    show_seconds: true
    clocks:
      - timezone: America/Los_Angeles
        label: HQ
        flag: us
      - timezone: Europe/London
        label: UK
        flag: gb
      - timezone: Asia/Singapore
        label: APAC
        flag: sg
```

## Common Timezones

- `America/New_York` - Eastern Time
- `America/Los_Angeles` - Pacific Time
- `Europe/London` - UK
- `Europe/Berlin` - Central European
- `Asia/Tokyo` - Japan
- `Asia/Shanghai` - China
- `Australia/Sydney` - Eastern Australia

See [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for all available timezones.

## Flag Codes

Common ISO 3166-1 alpha-2 codes: `us`, `gb`, `de`, `fr`, `jp`, `cn`, `au`, `sg`, `ae`, `in`

See [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) for all country codes.
