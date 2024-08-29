---
title: Zabbix
description: Zabbix Widget Configuration
---

Learn more about [Zabbix](https://github.com/zabbix/zabbix).

See the [Zabbix documentation](https://www.zabbix.com/documentation/current/en/manual/web_interface/frontend_sections/users/api_tokens) for details on generating API tokens.

The widget supports (at least) Zibbax server version 7.0.

Allowed fields: `["warning", "average", "high", "disaster"]`.

```yaml
widget:
  type: zabbix
  url: http://zabbix.host.or.ip/zabbix
  key: your-api-key
```
