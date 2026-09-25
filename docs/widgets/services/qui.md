---
title: qui
description: qui Widget Configuration
---

Learn more about [qui](https://github.com/autobrr/qui).

Generate an API key in qui under **Settings → API Keys**.

The widget has two modes:

- **Aggregated (default):** omit `instance` to show combined stats across all qBittorrent instances monitored by qui.
- **Per-instance:** set `instance` to the qui ID (visible in the qui UI) to show just that one.

```yaml
widget:
  type: qui
  url: http://qui.host.or.ip:7476
  key: quiapikeyquiapikeyquiapikey
  instance: 1 # optional; omit for aggregated stats across all instances
  fields: ["leech", "download", "seed", "upload"] # optional
```

## Fields

`leech` and `seed` are shown as `active / total` — torrents actively transferring over the
incomplete/complete totals.

Allowed fields: `["leech", "download", "seed", "upload", "total", "errored", "ratio", "freeSpace"]`
(maximum of 4). The default is `["leech", "download", "seed", "upload"]`.

Note: `ratio` and `freeSpace` are only available with the 'single instance' version of the widget.
