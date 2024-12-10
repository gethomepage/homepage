---
title: Translations Guide
description: Tips and tricks for translating and localizing Homepage widgets.
---

All text and numerical content in widgets should be translated and localized. English is the default language, and other languages can be added via [Crowdin](https://crowdin.com/project/gethomepage).

## Translations

Homepage uses the [next-i18next](https://github.com/i18next/next-i18next) library to handle translations. This library provides a set of hooks and utilities to help you localize your widgets, and Homepage has extended this library to support additional features.

=== "component.jsx"

    ```js
    import { useTranslation } from "next-i18next";

    import Container from "components/services/widget/container";
    import Block from "components/services/widget/block";

    export default function Component() {
      const { t } = useTranslation();

      return (
        <Container service={service}>
          <Block label="yourwidget.key1" />
          <Block label="yourwidget.key2" />
          <Block label="yourwidget.key3" />
        </Container>
      );
    }
    ```

## Set up translation strings

Homepage uses translated and localized strings for **all text and numerical content** in widgets. English is the default language, and other languages can be added via [Crowdin](https://crowdin.com/project/gethomepage). To add the English translations for your widget, follow these steps:

Open the `public/locales/en/common.js` file.

Add a new object for your widget to the bottom of the list, like this:

```json
"yourwidget": {
  "key1": "Value 1",
  "key2": "Value 2",
  "key3": "Value 3"
}
```

!!! note

    Even if you natively speak another language, you should only add English translations. You can then add translations in your native language via [Crowdin](https://crowdin.com/project/gethomepage), once your widget is merged.

## Common Translations

Homepage provides a set of common translations that you can use in your widgets. These translations are used to format numerical content, dates, and other common elements.

### Numbers

| Key                   | Translation     | Description                      |
| --------------------- | --------------- | -------------------------------- |
| `common.bytes`        | `1,000 B`       | Format a number in bytes.        |
| `common.bits`         | `1,000 bit`     | Format a number in bits.         |
| `common.bbytes`       | `1 KiB`         | Format a number in binary bytes. |
| `common.bbits`        | `1 Kibit`       | Format a number in binary bits.  |
| `common.byterate`     | `1,000 B/s`     | Format a byte rate.              |
| `common.bibyterate`   | `1 KiB/s`       | Format a binary byte rate.       |
| `common.bitrate`      | `1,000 bit/s`   | Format a bit rate.               |
| `common.bibitrate`    | `1 Kibit/s`     | Format a binary bit rate.        |
| `common.percent`      | `50%`           | Format a percentage.             |
| `common.number`       | `1,000`         | Format a number.                 |
| `common.ms`           | `1,000 ms`      | Format a number in milliseconds. |
| `common.date`         | `2024-01-01`    | Format a date.                   |
| `common.relativeDate` | `1 day ago`     | Format a relative date.          |
| `common.duration`     | `1 day, 1 hour` | Format an duration.              |

### Text

| Key                | Translation | Description        |
| ------------------ | ----------- | ------------------ |
| `resources.cpu`    | `CPU`       | CPU usage.         |
| `resources.mem`    | `MEM`       | Memory usage.      |
| `resources.total`  | `Total`     | Total resource.    |
| `resources.free`   | `Free`      | Free resource.     |
| `resources.used`   | `Used`      | Used resource.     |
| `resources.load`   | `Load`      | Load value.        |
| `resources.temp`   | `TEMP`      | Temperature value. |
| `resources.max`    | `Max`       | Maximum value.     |
| `resources.uptime` | `UP`        | Uptime.            |
