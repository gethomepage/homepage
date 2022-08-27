![Homepage Preview](/images/preview.png)

[![Docker](https://github.com/benphelps/homepage/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/benphelps/homepage/actions/workflows/docker-publish.yml)

## Features

  * Web Bookmarks
  * Service Bookmarks
    - Docker Integration
      - Status light + CPU, Memory & Network Reporting *(click on the status light)*
    - Service Integration
      - Currently supports Sonarr, Radarr, Ombi, Emby, Jellyfin, NZBGet, ruTorrent
      - Portainer, Speedtest Tracker, PiHole
  * Homepage Widgets
    - System Stats (Disk, CPU, Memory)
    - Weather (via weatherapi.com)
  * Customizable
    - 21 theme colors with light and dark mode support

## Support & Suggestions

If you have any questions, suggestions, or general issues, please start a discussion on the [Discussions](https://github.com/benphelps/homepage/discussions) page.

If you have a more specific issue, please open an issue on the [Issues](https://github.com/benphelps/homepage/issues) page.

## Getting Started

You can run the homepage from a docker container or locally using node.

### With Docker

Using docker compose:

```yaml
version: '3.3'
services:
    homepage:
        image: ghcr.io/benphelps/homepage:main
        container_name: homepage
        ports:
            - 3000:3000
        volumes:
            - /path/to/config:/app/config
            - /var/run/docker.sock:/var/run/docker.sock # (optional) For docker integrations
```

or docker run:

```bash
docker run -p 3000:3000 -v /path/to/config:/app/config -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/benphelps/homepage:main
```

### With Node

First, clone the repository:

```bash
git clone https://github.com/benphelps/homepage.git
```

Then install dependencies and build the production bundle (I'm using pnpm here, you can use npm or yarn if you like):

```bash
pnpm install
pnpm build
```

Finally, run the server:

```bash
pnpm start
```

## Configuration

Configuration files will be genereted and placed on the first request.

Configuration is done in the /config directory using .yaml files.  Refer to each config for
the specific configuration options.

## Development

Install NPM packages, this project uses [pnpm](https://pnpm.io/) (and so should you!):

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start.

This is a [Next.js](https://nextjs.org/) application, see their doucmentation for more information:
