---
title: Troubleshooting
description: Basic Troubleshooting
icon: material/message-question
hide:
  - navigation
---

## General Troubleshooting Tips

- For API errors, clicking the "API Error Information" button in the widget will usually show some helpful information as to whether the issue is reaching the service host, an authentication issue, etc.
- Check config/logs/homepage.log, on docker simply e.g. `docker logs homepage`. This may provide some insight into the reason for an error.
- Check the browser error console, this can also sometimes provide useful information.
- Consider setting the `ENV` variable `LOG_LEVEL` to `debug`.
- If certain widgets are failing when connecting to public APIs, consider [disabling IPv6](#disabling-ipv6).

## Service Widget Errors

All service widgets work essentially the same, that is, homepage makes a proxied call to an API made available by that service. The majority of the time widgets don't work it is a configuration issue. Of course, sometimes things do break. Some basic steps to check:

1.  URLs should not end with a / or other API path. Each widget will handle the path on its own.

2.  All services with a widget require a unique name as well as a unique group (and all subgroups) name.

3.  Verify the homepage installation can connect to the IP address or host you are using for the widget `url`. This is most simply achieved by pinging the server from the homepage machine, in Docker this means _from inside the container_ itself, e.g.:

    ```
    docker exec homepage ping SERVICEIPORDOMAIN
    ```

    If your homepage install (container) cannot reach the service then you need to figure out why, for example in Docker this can mean putting the two containers on the same network, checking firewall issues, etc.

4.  If you have verified that homepage can in fact reach the service then you can also check the API output using e.g. `curl`, which is often helpful if you do need to file a bug report. Again, depending on your networking setup this may need to be run from _inside the container_ as IP / hostname resolution can differ inside vs outside.

    !!! note

        `curl` is not installed in the base image by default but can be added inside the container with `apk add curl`.

    The exact API endpoints and authentication vary of course, but in many cases instructions can be found by searching the web or if you feel comfortable looking at the homepage source code (e.g. `src/widgets/{widget}/widget.js`).

    It is out of the scope of this to go into full detail about how to , but an example for PiHole would be:

    ```
    curl -L -k http://PIHOLEIPORHOST/admin/api.php
    ```

    Or for AdGuard:

    ```
    curl -L -k -u 'username:password' http://ADGUARDIPORHOST/control/stats
    ```

    Or for Portainer:

    ```
    curl -L -k -H 'X-Api-Key:YOURKEY' 'https://PORTAINERIPORHOST:PORT/api/endpoints/2/docker/containers/json'
    ```

    Sonarr:

    ```
    curl -L -k 'http://SONARRIPORHOST:PORT/api/v3/queue?apikey=YOURAPIKEY'
    ```

    This will return some data which may reveal an issue causing a true bug in the service widget.

## Missing custom icons

If, after correctly adding and mapping your custom icons via the [Icons](../configs/services.md#icons) instructions, you are still unable to see your icons please try recreating your container.

## Disabling IPv6

If you are having issues with certain widgets that are unable to reach public APIs (e.g. weather), in certain setups you may need to disable IPv6. You can set the environment variable `HOMEPAGE_PROXY_DISABLE_IPV6` to `true` to disable IPv6 for the homepage proxy.

Alternatively, you can use the `sysctls` option in your docker-compose file to disable IPv6 for the homepage container completely:

```yaml
services:
  homepage:
    ...
    sysctls:
      - net.ipv6.conf.all.disable_ipv6=1
```
