---
title: OctoPrint
description: OctoPrintWidget Configuration
---

[OctoPrint](https://octoprint.org/) - OctoPrint is an open source 3D printer controller application, which provides a web interface for the connected printers. 

Allowed fields: `["printer_state", "temp_tool", "temp_bed", "job_completion"]`.

```yaml
widget:
  type: octoprint
  url: http://octoprint.host.or.ip:port
  key: youroctoprintapikey
```
