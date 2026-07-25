---
title: Custom CSS & JS
description: Adding Custom CSS or JS
---

As of version v0.6.30 homepage supports adding your own custom css & javascript. Please do so **at your own risk**.

To add custom css simply edit the `custom.css` file under your config directory, similarly for javascript you would edit `custom.js`. You can then target elements in homepage with various classes / ids to customize things to your liking.

You can also set a specific `id` for a service or bookmark to target with your custom css or javascript, e.g.

```yaml
Service:
    id: myserviceid
    icon: icon.png
    ...
```

## Targeting Service Groups by Name

Each service group wrapper `<div>` contains a `data-group` attribute set to the group's name,
allowing you to target specific groups in custom CSS:

```css
/* Target a specific service group by name */
div[data-group="My Services"] {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

div[data-group="My Services"] .service-group-name {
  color: #f0c040;
}
```

## Custom Data Attributes on Groups and Services

You can pass arbitrary `data-*` attributes to service groups and individual services
using the `data:` key in your config. This enables powerful CSS and JS targeting
without modifying Homepage's code.

### On Service Groups

Add `data:` to a group's layout block to attach custom attributes to the group wrapper `<div>`:

```yaml
My Group:
  icon: mdi:folder
  data:
    environment: production
    region: us-west
  services:
    - ...
```

This renders `<div data-group="My Group" data-environment="production" data-region="us-west" ...>`.

### On Services

Add `data:` to a service definition:

```yaml
- name: My App
  href: https://example.com
  icon: mdi:web
  data:
    tier: critical
    team: platform
```

## Custom CSS Classes on Groups and Services

You can add extra CSS classes to service groups and individual service items
using the `class:` key:

### On Service Groups

```yaml
My Group:
  icon: mdi:folder
  class: bordered highlight
  services:
    - ...
```

The `class` value is added to the group wrapper `<div>` alongside the built-in classes.

### On Services

```yaml
- name: My App
  href: https://example.com
  icon: mdi:web
  class: pulse-animation
```

The `class` value is added to the service `<li>` alongside the default `service` class.

### CSS Examples

```css
/* Target services in production with a green left border */
.service-card[data-tier="critical"] {
  border-left: 4px solid #e74c3c;
}

/* Apply animation to specific service */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```
