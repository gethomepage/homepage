---
title: OpenMediaVault
description: OpenMediaVault Widget Configuration
---

Learn more about [OpenMediaVault](https://www.openmediavault.org/).

Provides useful information from your OpenMediaVault

```yaml
widget:
  type: openmediavault
  url: http://omv.host.or.ip
  username: admin
  password: pass
  method: services.getStatus # required
```

## Methods

The method field determines the type of data to be displayed and is required. Supported methods:

`services.getStatus`: Shows status of running services. Allowed fields: `["running", "stopped", "total"]`

`smart.getListBg`: Shows S.M.A.R.T. status from disks. Allowed fields: `["passed", "failed"]`

`downloader.getDownloadList`: Displays the number of tasks from the Downloader plugin currently being downloaded and total. Allowed fields: `["downloading", "total"]`
