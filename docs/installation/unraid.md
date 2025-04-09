---
title: UNRAID Installation
description: Install and run homepage on UNRAID
---

Homepage has an UNRAID community package that you may use to install homepage. This is the easiest way to get started with homepage on UNRAID.

## Install the Plugin

- In the UNRAID webGUI, go to the **Apps** tab.
- In the search bar, search for `homepage`.
- Click on **Install**.
- Change the parameters to your liking.
  - Click on **APPLY**.

## Run the Container

- While the container is running, open the WebUI.
  - Opening the page will generate the configuration files.

You may need to set the permissions of the folders to be able to edit the files.

- Click on the Homepage icon.
- Click on **Console**.
  - Enter `chmod -R u-x,go-rwx,go+u,ugo+X /app/config` and press **Enter**.
  - Enter `chmod -R u-x,go-rwx,go+u,ugo+X /app/public/icons` and press **Enter**.
  - Enter `chown -R nobody:users /app/config` and press **Enter**.
  - Enter `chown -R nobody:users /app/public/icons` and press **Enter**.

## Some Other Notes

- To use the [Docker integration](../configs/docker.md), you only need to use the `container:` parameter. There is no need to set the server.

!!! note

      To view detailed container statistics (CPU, RAM, etc.), or if you use a remote docker socket, `container:` will still need to be set. For example:

```
    - Plex:
        icon: /icons/plex.png
        href: https://app.plex.com
        container: plex
```

- When you upload a new image into the **/images** folder, you will need to restart the container for it to show up in the WebUI. Please see the [service icons](../configs/services.md#icons) for more information.
