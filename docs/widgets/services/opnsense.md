---
title: OPNSense
description: OPNSense Widget Configuration
---

Learn more about [OPNSense](https://opnsense.org/).

The API key & secret can be generated via the webui by creating a new user at _System/Access/Users_. Ensure "Generate a scrambled password to prevent local database logins for this user" is checked and then edit the effective privileges selecting **only**:

- Diagnostics: System Activity
- Status: Traffic Graph

Finally, create a new API key which will download an `apikey.txt` file with your key and secret in it. Use the values as the username and password fields, respectively, in your homepage config.

Allowed fields: `["cpu", "memory", "wanUpload", "wanDownload"]`.

```yaml
widget:
  type: opnsense
  url: http://opnsense.host.or.ip
  username: key
  password: secret
```
