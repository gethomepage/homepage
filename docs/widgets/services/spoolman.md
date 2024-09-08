---
title: Spoolman
description: Spoolman Widget Configuration
---

Learn more about [Spoolman](https://github.com/Donkie/Spoolman).

Keep track of your inventory of 3D-printer filament spools.
Spoolman is a self-hosted web service designed to help you efficiently manage your 3D printer filament spools and monitor their usage. It acts as a centralized database that seamlessly integrates with popular 3D printing software like OctoPrint and Klipper/Moonraker. When connected, it automatically updates spool weights as printing progresses, giving you real-time insights into filament usage.

```yaml
widget:
  type: spoolman
  url: http://spoolman.host.or.ip
```
