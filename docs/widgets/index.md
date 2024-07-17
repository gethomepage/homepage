---
title: Widgets
description: Find information on how to configure specific widgets in Homepage.
icon: material/widgets
---

Homepage has two types of widgets: info and service. Below we'll cover each type and how to configure them.

The left navigation of this site contains links to all available widgets.

## Service Widgets

Service widgets are used to display the status of a service, often a web service or API. Services (and their widgets) are defined in your `services.yaml` file. Here's an example:

```yaml
- Plex:
    icon: plex.png
    href: https://plex.my.host
    description: Watch movies and TV shows.
    server: localhost
    container: plex
    widget:
      type: tautulli
      url: http://172.16.1.1:8181
      key: aabbccddeeffgghhiijjkkllmmnnoo
```

## Info Widgets

Info widgets are used to display information in the header, often about your system or environment. Info widgets are defined your `widgets.yaml` file. Here's an example:

```yaml
- openmeteo:
    label: Current
    latitude: 36.66
    longitude: -117.51
    cache: 5
```
