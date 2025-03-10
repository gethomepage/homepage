---
title: OpenStack
description: OpenStack Widget Configuration
---

Learn more about [OpenStack](https://docs.openstack.org/).

```yaml
widget:
    type: openstack
    version: v2.1
    idpUrl: http://keystone.host.or.ip:port
    url: http://openstack.host.or.ip:port
    appCredId: app_credential_id
    appCredName: app_credential_name
    appCredSecret: app_credential_secret
    server: server_id # optional, will display cluster stats if omitted
    enableDiagnostics: false # optional, only applicable for server widget
    enableNetwork: true # optional, only applicable for server widget
```

In order to use the widget, you will need to obtain an application credential via the web interface (Identity > Application Credentials) or via CLI as described in the [documentation](https://docs.openstack.org/keystone/2024.2/admin/oauth2-usage-guide.html). Said credential should be assigned the role *reader* and have the following acces rules:

```json
[
    {
        "path": "/v2.1/servers/**",
        "method": "GET",
        "service": "compute"
    }
]
```

Limitations: Advanced diagnostics data (RAM, CPU time) can currently only be retrieved for libvirt based instances.