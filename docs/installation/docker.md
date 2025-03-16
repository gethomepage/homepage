---
title: Docker Installation
description: Install and run homepage from Docker
---

Using docker compose:

```yaml
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    ports:
      - 3000:3000
    volumes:
      - /path/to/config:/app/config # Make sure your local config directory exists
      - /var/run/docker.sock:/var/run/docker.sock # (optional) For docker integrations
    environment:
      HOMEPAGE_ALLOWED_HOSTS: gethomepage.dev # required, may need port. See gethomepage.dev/installation/#homepage_allowed_hosts
```

### Running as non-root

By default, the Homepage container runs as root. Homepage also supports running your container as non-root via the standard `PUID` and `PGID` environment variables. When using these variables, make sure that any volumes mounted in to the container have the correct ownership and permissions set.

_Using the docker socket directly is not the recommended method of integration and requires either running homepage as root or that the user be part of the docker group_

In the docker compose example below, the environment variables `$PUID` and `$PGID` are set in a `.env` file.

```yaml
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    ports:
      - 3000:3000
    volumes:
      - /path/to/config:/app/config # Make sure your local config directory exists
      - /var/run/docker.sock:/var/run/docker.sock # (optional) For docker integrations, see alternative methods
    environment:
      HOMEPAGE_ALLOWED_HOSTS: gethomepage.dev # required, may need port. See gethomepage.dev/installation/#homepage_allowed_hosts
      PUID: $PUID
      PGID: $PGID
```

### With Docker Run

```bash
docker run -p 3000:3000 -e HOMEPAGE_ALLOWED_HOSTS=gethomepage.dev -v /path/to/config:/app/config -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/gethomepage/homepage:latest
```

### Using Environment Secrets

You can also include environment variables in your config files to protect sensitive information. Note:

- Environment variables must start with `HOMEPAGE_VAR_` or `HOMEPAGE_FILE_`
- The value of env var `HOMEPAGE_VAR_XXX` will replace `{{HOMEPAGE_VAR_XXX}}` in any config
- The value of env var `HOMEPAGE_FILE_XXX` must be a file path, the contents of which will be used to replace `{{HOMEPAGE_FILE_XXX}}` in any config
