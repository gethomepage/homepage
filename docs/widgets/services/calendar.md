---
title: Calendar
description: Calendar widget
---

## Monthly view

<img alt="calendar" src="https://user-images.githubusercontent.com/5442891/271131282-6767a3ea-573e-4005-aeb9-6e14ee01e845.png">

This widget shows monthly calendar, with optional integrations to show events from supported widgets.

```yaml
widget:
  type: calendar
  firstDayInWeek: sunday # optional - defaults to monday
  view: monthly # optional - possible values monthly, agenda
  maxEvents: 10 # optional - defaults to 10
  integrations: # optional
    - type: sonarr # active widget type that is currently enabled on homepage - possible values: radarr, sonarr, lidarr, readarr
      service_group: Media # group name where widget exists
      service_name: Sonarr # service name for that widget
      color: teal # optional - defaults to pre-defined color for the service (teal for sonarr)
      params: # optional - additional params for the service
        unmonitored: true # optional - defaults to false, used with *arr stack
```

## Agenda

This view shows only list of events from configured integrations

```yaml
widget:
  type: calendar
  view: agenda
  maxEvents: 10 # optional - defaults to 10
  integrations: # same as in Monthly view example
```

## Integrations

Currently integrated widgets are [sonarr](sonarr.md), [radarr](radarr.md), [lidarr](lidarr.md) and [readarr](readarr.md).

Supported colors can be found on [color palette](../../configs/settings.md#color-palette).
