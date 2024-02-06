---
title: Authentik
description: Authentik Widget Configuration
---

Learn more about [Authentik](https://github.com/goauthentik/authentik).

This widget reads the number of active users in the system, as well as logins for the last 24 hours.

You will need to generate an API token for an existing user. To do so follow these steps:

1. Navigate to the Authentik Admin Portal
2. Expand Directory, the click Tokens & App passwords
3. Click the Create button
4. Fill out the dialog making sure to set Intent to API Token
5. Click the Create button on the dialog
6. Click the copy button on the far right of the newly created API Token

Allowed fields: `["users", "loginsLast24H", "failedLoginsLast24H"]`.

```yaml
widget:
  type: authentik
  url: http://authentik.host.or.ip:22070
  key: api_token
```
