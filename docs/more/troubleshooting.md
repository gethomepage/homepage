---
title: Troubleshooting
description: Basic Troubleshooting

hide:
  - navigation
---

## Introducing the Homepage AI Bot

Thanks to the generous folks at [Glime](https://glimelab.ai), Homepage is now equipped with a pretty helpful AI-powered bot. The bot has full knowledge of our docs, GitHub issues and discussions and great at answering specific questions about setting up your Homepage. To use the bot, just hit the 'Ask AI' button on any page in our docs or check out the [#ai-support channel on Discord](https://discord.com/channels/1019316731635834932/1177885603552038993)!

## General Troubleshooting Tips

- For API errors, clicking the "API Error Information" button in the widget will usually show some helpful information as to whether the issue is reaching the service host, an authentication issue, etc.
- Check config/logs/homepage.log, on docker simply e.g. `docker logs homepage`. This may provide some insight into the reason for an error.
- Check the browser error console, this can also sometimes provide useful information.
- Consider setting the `ENV` variable `LOG_LEVEL` to `debug`.

## Service Widget Errors

All service widgets work essentially the same, that is, homepage makes a proxied call to an API made available by that service. The majority of the time widgets don't work it is a configuration issue. Of course, sometimes things do break. Some basic steps to try:

1.  Ensure that you follow the rule mentioned on https://gethomepage.dev/latest/configs/service-widgets/. **Unless otherwise noted, URLs should not end with a / or other API path. Each widget will handle the path on its own.**. This is very important as including a trailing slash can result in an error.

2.  Verify the homepage installation can connect to the IP address or host you are using for the widget `url`. This is most simply achieved by pinging the server from the homepage machine, in Docker this means _from inside the container_ itself, e.g.:

    ```
    docker exec homepage ping SERVICEIPORDOMAIN
    ```

    If your homepage install (container) cannot reach the service then you need to figure out why, for example in Docker this can mean putting the two containers on the same network, checking firewall issues, etc.

3.  If you have verified that homepage can in fact reach the service then you can also check the API output using e.g. `curl`, which is often helpful if you do need to file a bug report. Again, depending on your networking setup this may need to be run from _inside the container_ as IP / hostname resolution can differ inside vs outside.

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
