---
title: OpenStack
description: OpenStack Widget Configuration
---

Learn more about [OpenStack](https://docs.openstack.org/).

```yaml
widget:
  type: openstack
  version: v2.1
  identityUrl: http://keystone.host.or.ip:port
  url: http://openstack.host.or.ip:port
  appCredId: app_credential_id
  appCredName: app_credential_name
  appCredSecret: app_credential_secret
  server: server_id # optional, will display cluster stats if omitted
  enableDiagnostics: false # optional, only applicable for server widget
  enableNetwork: true # optional, only applicable for server widget
```

In order to use the widget, an application credential must be obtained via the web interface (Identity > Application Credentials) or via CLI as described in the [documentation](https://docs.openstack.org/keystone/2024.2/admin/oauth2-usage-guide.html). Said credential must be assigned role _reader_ or _admin_ if diagnostics data should be displayed.

Limitations:

- Widget currently only supports Identity API v3 and Compute API v2.1
- Diagnostics data can only be retrieved for libvirt based instances
