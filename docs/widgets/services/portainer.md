---
title: Portainer
description: Portainer Widget Configuration
---

Learn more about [Portainer](https://github.com/portainer/portainer).

You'll need to make sure you have the correct environment set for the integration to work properly. From the Environments section inside of Portainer, click the one you'd like to connect to and observe the ID at the end of the URL (should be), something like `#!/endpoints/1`, here `1` is the value to set as the `env` value. In order to generate an API key, please follow the steps outlined here https://docs.portainer.io/api/access.

Allowed fields: `["running", "stopped", "total"]`.

```yaml
widget:
  type: portainer
  url: https://portainer.host.or.ip:9443
  env: 1
  key: ptr_accesskeyaccesskeyaccesskeyaccesskey
```
