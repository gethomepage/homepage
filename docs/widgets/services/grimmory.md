---
title: Grimmory
description: Grimmory Widget Configuration
---

Learn more about [Grimmory](https://github.com/grimmory-tools/grimmory).

The widget authenticates with your Grimmory credentials to surface total libraries, books, and reading progress counts.

## Adding the Widget

Please refer to the [documentation](https://gethomepage.dev/latest/configs/services/) for general service configuration options.

```yaml
- Grimmory:
    icon: grimmory.png
    href: http://grimmory.local
    widget:
      type: grimmory
      url: http://grimmory.local:6060
      username: my-username
      password: my-password
```
