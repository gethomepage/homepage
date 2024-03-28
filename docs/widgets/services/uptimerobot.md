---
title: UptimeRobot
description: UptimeRobot Widget Configuration
---

Learn more about [UptimeRobot](https://uptimerobot.com/).

To generate an API key, select `My Settings`, and either `Monitor-Specific API Key` or `Read-Only API Key`.

A `Monitor-Specific API Key` will provide the following detailed information
for the selected monitor:

- Current status
- Current uptime
- Date/time of last downtime
- Duration of last downtime

Allowed fields: `["status", "uptime", "lastDown", "downDuration"]`.

A `Read-Only API Key` will provide a summary of all monitors in your account:

- Number of 'Up' monitors
- Number of 'Down' monitors

Allowed fields: `["sitesUp", "sitesDown"]`.

```yaml
widget:
  type: uptimerobot
  url: https://api.uptimerobot.com
  key: uptimerobotapitoken
```
