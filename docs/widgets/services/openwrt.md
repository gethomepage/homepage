---
title: OpenWRT
description: OpenWRT widget configuration
---

Learn more about [OpenWRT](https://openwrt.org/).

Provides information from OpenWRT

```yaml
widget:
  type: openwrt
  url: http://host.or.ip
  username: homepage
  password: pass
  interfaceName: eth0 # optional
```

## Interface

Setting `interfaceName` (e.g. eth0) will display information for that particular device, otherwise the widget will display general system info.

## Authorization

In order for homepage to access the OpenWRT RPC endpoints you will need to [create an ACL](https://openwrt.org/docs/techref/ubus#acls) and [new user](https://openwrt.org/docs/techref/ubus#authentication) in OpenWRT.

Create an ACL named `homepage.json` in `/usr/share/rpcd/acl.d/`, the following permissions will suffice:

```json
{
  "homepage": {
    "description": "Homepage widget",
    "read": {
      "ubus": {
        "network.interface.wan": ["status"],
        "network.interface.lan": ["status"],
        "network.device": ["status"],
        "system": ["info"]
      }
    }
  }
}
```

Create a `crypt(5)` password hash using the following command in the OpenWRT shell:

```sh
uhttpd -m "<somepassphrase>"
```

Then add a user that will use the ACL and hashed password in `/etc/config/rpcd`:

```
config login
        option username 'homepage'
        option password '<hashedpassword>'
        list read homepage
```

This username and password will be used in Homepage's services.yaml to grant access.
