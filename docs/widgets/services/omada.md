---
title: Omada
description: Omada Widget Configuration
---

The widget supports controller versions 3, 4, 5 and 6.

Allowed fields: `["connectedAp", "activeUser", "alerts", "connectedGateways", "connectedSwitches"]`.

## Account authentication

Use an Omada controller account for `username` and `password`. An Open API application's Client ID and Client Secret are not account credentials.

```yaml
widget:
  type: omada
  url: http://omada.host.or.ip:port
  username: username
  password: password
  site: sitename
```

## Open API authentication

Controllers with Open API support can use a Client Credentials application instead of an account login. This authentication method has been tested with Omada 6.3.0.108.

In the controller's Global View, go to **Settings → Platform Integration → Open API**, create an application in **Client mode**, and grant it access to the desired site, its dashboard overview, and its alert logs. Use that application's Client ID and Client Secret:

```yaml
widget:
  type: omada
  url: https://omada.host.or.ip:8043
  clientId: "{{HOMEPAGE_VAR_OMADA_CLIENT_ID}}"
  clientSecret: "{{HOMEPAGE_VAR_OMADA_CLIENT_SECRET}}"
  site: sitename
  # omadacId: your-controller-id # optional when /api/info is available
```

When either `clientId` or `clientSecret` is configured, the widget uses Open API authentication and requires both values. Omit `username` and `password` in this mode. Homepage obtains and renews the temporary access token automatically; do not put an access token in `clientSecret`.

Use the application's **Interface Access Address** for `url`. Homepage discovers the controller ID from `/api/info` by default. If this endpoint is unavailable at that address, also specify the application's **Omada ID** as `omadacId`.

The `site` value is the site's name. The `alerts` field counts unresolved alerts across the controller's retained log history. Statistics are cached for five seconds, and concurrent requests share authentication and polling.
