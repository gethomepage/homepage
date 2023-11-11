---
title: Service Widgets
description: Service Widget Configuration
---

Unless otherwise noted, URLs should not end with a `/` or other API path. Each widget will handle the path on its own.

Each service can have one widget attached to it (often matching the service type, but that's not forced).

In addition to the href of the service, you can also specify the target location in which to open that link. See [Link Target](settings.md#link-target) for more details.

Using Emby as an example, this is how you would attach the Emby service widget.

```yaml
- Emby:
    icon: emby.png
    href: http://emby.host.or.ip/
    description: Movies & TV Shows
    widget:
      type: emby
      url: http://emby.host.or.ip
      key: apikeyapikeyapikeyapikeyapikey
```

## Field Visibility

Each widget can optionally provide a list of which fields should be visible via the `fields` widget property. If no fields are specified, then all fields will be displayed. The `fields` property must be a valid YAML array of strings. As an example, here is the entry for Sonarr showing only a couple of fields.

**In all cases a widget will work and display all fields without specifying the `fields` property.**

```yaml
- Sonarr:
    icon: sonarr.png
    href: http://sonarr.host.or.ip
    widget:
      type: sonarr
      fields: ["wanted", "queued"]
      url: http://sonarr.host.or.ip
      key: apikeyapikeyapikeyapikeyapikey
```
