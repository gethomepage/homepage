---
title: Pangolin
description: Pangolin Widget Configuration
---

Learn more about [Pangolin](https://github.com/fosrl/pangolin).

This widget shows sites (online/total), resources (healthy/total), targets (healthy/total), and traffic statistics for a Pangolin organization. A resource is considered healthy if at least one of its targets is healthy, or if it has no targets.

Allowed fields: `["sites", "resources", "targets", "traffic", "in", "out"]` (maximum of 4).

```yaml
widget:
  type: pangolin
  url: https://api.pangolin.net
  key: your-api-key
  org: your-org-id
```

Find your organization ID in the URL when logged in (e.g., `https://app.pangolin.net/{org-id}/...`).

## API Key Setup

Create an API key with the following permissions:

- **List Sites**
- **List Resources**

**Self-Hosted:** Enable the [Integration API](https://docs.pangolin.net/self-host/advanced/integration-api) in your Pangolin configuration before creating the key.
