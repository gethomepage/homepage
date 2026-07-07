---
title: qui
description: qui Widget Configuration
---

Learn more about [qui](https://github.com/autobrr/qui).

qui manages one or more qBittorrent instances behind a single web UI. The widget shows transfer
stats and authenticates with a qui API key, so you never expose a qBittorrent WebUI password.

Generate an API key in qui under **Settings → API Keys**.

The widget has two modes:

- **Aggregated (default):** omit `instance` to show combined stats across all qBittorrent instances monitored by qui.
- **Per-instance:** set `instance` to the numeric ID qui assigns to a qBittorrent instance to show
  just that one. Add one widget per instance. The ID is visible in the qui UI URL when an instance is
  selected (`/instances/1/...`) or via `GET {url}/api/instances`.

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

- `leech`: active downloading / incomplete torrents
- `download`: total download speed
- `seed`: active seeding / complete torrents
- `upload`: total upload speed
- `total`: total number of torrents
- `errored`: number of errored torrents
- `ratio`: global share ratio (per-instance only; unavailable in aggregated mode)
- `freeSpace`: free disk space (per-instance only; unavailable in aggregated mode)
