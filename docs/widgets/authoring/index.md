---
title: Guides & Tutorials
description: Learn how to create and customize widgets in Homepage. Explore translations, widget components, widget metadata, proxy handlers, and making API calls.
icon: fontawesome/solid/graduation-cap
---

Widgets are a core component of Homepage. They are used to display information about your system, services, and environment.

## Overview

If you are new to Homepage widgets, and are looking to create a new widget, please follow along with the guide here: [Widget Tutorial](tutorial.md).

### Translations

All text and numerical content in widgets should be translated and localized. English is the default language, and other languages can be added via [Crowdin](https://crowdin.com/project/gethomepage).

To learn more about translations, please refer to the guide here: [Translations Guide](translations.md).

### Widget Component

The widget component is the core of the widget. It is responsible for [fetching data from the API](api.md) and rendering the widget UI. Homepage provides a set of hooks and utilities to help you build your widget component.

To learn more about widget components, please refer to the guide here: [Component Guide](component.md).

### Widget Metadata

Widget metadata defines the configuration of the widget. It defines the API endpoint to fetch data from, the proxy handler to use, and any data mappings.

To learn more about widget metadata, endpoint and data mapping, please refer to the guide here: [Metadata Guide](metadata.md).

To learn more about proxy handlers, please refer to the guide here: [Proxies Guide](proxies.md).

To learn more about making API calls from inside your widget, please refer to the guide here: [API Guide](api.md).
