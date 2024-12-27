---
title: Information Widgets
description: Homepage info widgets.
---

Information widgets are widgets that provide information about your system or environment and are displayed at the top of the homepage. You can find a list of all available info widgets under the [Info Widgets](../widgets/info/index.md) section.

Info widgets are defined in the widgets.yaml

Each widget has its own configuration options, which are detailed in the widget's documentation.

## Layout

Info widgets are displayed in the order they are defined in the `widgets.yaml` file. You can change the order by moving the widgets around in the file. However, some widgets (weather, search and datetime) are aligned to the right side of the screen which can affect the layout of the widgets.

## Adding A Link

You can add a link to an info widget such as the logo or text widgets by adding an `href` option, for example:

```yaml
logo:
  href: https://example.com
  target: _blank # Optional, can be set in settings
```
