---
title: Pangolin
description: Pangolin Widget Configuration
---

Learn more about [Pangolin](https://github.com/fosrl/pangolin).

This widget shows the number of organizations, sites (online/total), resources (healthy/total), and targets (healthy/total) managed by Pangolin. A resource is considered healthy if at least one of its targets is healthy, or if it has no targets.

Allowed fields: `["orgs", "sites", "resources", "targets"]`.

```yaml
widget:
  type: pangolin
  url: https://api.pangolin.net
  key: your-api-key
  org: your-org-id # optional if self-hosted, required for Pangolin Cloud
```

For self-hosted Pangolin with root API access, `org` can be omitted and all organizations will be discovered automatically.

## API Key Setup

### Self-Hosted Pangolin

Enable the [Integration API](https://docs.pangolin.net/self-host/advanced/integration-api) in your Pangolin configuration and create an API key which includes the following permissions:

- **List Organizations** (if not specifying `org` in config)
- **List Sites**
- **List Resources**

### Hosted Pangolin (app.pangolin.net)

Create an org-scoped API key with the following permissions:

- **List Sites**
- **List Resources**

Find your organization ID in the URL when logged in (e.g., `https://app.pangolin.net/{org-id}/...`) and specify it in the `org` config option.
