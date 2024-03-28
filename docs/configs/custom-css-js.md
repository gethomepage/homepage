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
