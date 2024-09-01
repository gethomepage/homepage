---
title: Zabbix
description: Zabbix Widget Configuration
---

Learn more about [Zabbix](https://github.com/zabbix/zabbix). The widget supports (at least) Zibbax server version 7.0.

---

Allowed fields: `["unclassified", "information", "warning", "average", "high", "disaster"]`.

Only 4 fields can be shown at a time, with the default being: `["warning", "average", "high", "disaster"]`.

```yaml
widget:
  type: zabbix
  url: http://zabbix.host.or.ip/zabbix
  key: your-api-key
```

See the [Zabbix documentation](https://www.zabbix.com/documentation/current/en/manual/web_interface/frontend_sections/users/api_tokens) for details on generating API tokens.
