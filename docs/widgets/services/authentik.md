---
title: Authentik
description: Authentik Widget Configuration
---

Learn more about [Authentik](https://github.com/goauthentik/authentik).

This widget reads the number of active users in the system, as well as logins for the last 24 hours.

You will need to generate an API token for an existing user under `Admin Portal` > `Directory` > `Tokens & App passwords`.
Make sure to set Intent to "API Token".

The account you made the API token for also needs the following **Assigned global permissions** in Authentik:

- authentik Core
  - User
- authentik Events
  - Event

Allowed fields: `["users", "loginsLast24H", "failedLoginsLast24H"]`.

```yaml
widget:
  type: authentik
  url: http://authentik.host.or.ip:22070
  key: api_token
```
