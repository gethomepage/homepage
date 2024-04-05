<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="images/banner_light@2x.png">
    <img src="images/banner_dark@2x.png" width="65%">
  </picture>
</p>

<p align="center">
  A modern, <em>fully static, fast</em>, secure <em>fully proxied</em>, highly customizable application dashboard with integrations for over 100 services and translations into multiple languages. Easily configured via YAML files or through docker label discovery.
</p>

<p align="center">
  <img src="images/1.png?v=2" />
</p>

<p align="center">
  <a href="https://github.com/gethomepage/homepage/actions/workflows/docker-publish.yml"><img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/gethomepage/homepage/docker-publish.yml"></a>
  &nbsp;
  <a href="https://crowdin.com/project/gethomepage" target="_blank"><img src="https://badges.crowdin.net/gethomepage/localized.svg"></a>
  &nbsp;
  <a href="https://discord.gg/k4ruYNrudu"><img alt="Discord" src="https://img.shields.io/discord/1019316731635834932"></a>
  &nbsp;
  <a href="http://gethomepage.dev/latest/" title="Docs"><img title="Docs" src="https://github.com/gethomepage/homepage/actions/workflows/docs-publish.yml/badge.svg"/></a>
  &nbsp;
  <a href="https://paypal.me/phelpsben" title="Donate"><img alt="GitHub Sponsors" src="https://img.shields.io/github/sponsors/benphelps"></a>
</p>

# Features

With features like quick search, bookmarks, weather support, a wide range of integrations and widgets, an elegant and modern design, and a focus on performance, Homepage is your ideal start to the day and a handy companion throughout it.

- **Fast** - The site is statically generated at build time for instant load times.
- **Secure** - All API requests to backend services are proxied, keeping your API keys hidden. Constantly reviewed for security by the community.
- **For Everyone** - Images built for AMD64, ARM64, ARMv7, and ARMv6.
- **Full i18n** - Support for over 40 languages.
- **Service & Web Bookmarks** - Add custom links to the homepage.
- **Docker Integration** - Container status and stats. Automatic service discovery via labels.
- **Service Integration** - Over 100 service integrations, including popular starr and self-hosted apps.
- **Information & Utility Widgets** - Weather, time, date, search, and more.
- **And much more...**

## Docker Integration

Homepage has built-in support for Docker, and can automatically discover and add services to the homepage based on labels. See the [Docker Service Discovery](https://gethomepage.dev/latest/configs/docker/#automatic-service-discovery) page for more information.

## Service Widgets

Homepage also has support for over 100 3rd party services, including all popular starr apps, and most popular self-hosted apps. Some examples include: Radarr, Sonarr, Lidarr, Bazarr, Ombi, Tautulli, Plex, Jellyfin, Emby, Transmission, qBittorrent, Deluge, Jackett, NZBGet, SABnzbd, etc. As well as service integrations, Homepage also has a number of information providers, sourcing information from a variety of external 3rd party APIs. See the [Service](https://gethomepage.dev/latest/widgets/) page for more information.

## Information Widgets

Homepage has built-in support for a number of information providers, including weather, time, date, search, glances and more. System and status information presented at the top of the page. See the [Information Providers](https://gethomepage.dev/latest/widgets/) page for more information.

## Customization

Homepage is highly customizable, with support for custom themes, custom CSS & JS, custom layouts, formatting, localization and more. See the [Settings](https://gethomepage.dev/latest/configs/settings/) page for more information.

# Getting Started

For configuration options, examples and more, [please check out the homepage documentation](http://gethomepage.dev).

## With Docker

Using docker compose:

```yaml
version: "3.3"
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    environment:
      PUID: 1000 -- optional, your user id
      PGID: 1000 -- optional, your group id
    ports:
      - 3000:3000
    volumes:
      - /path/to/config:/app/config # Make sure your local config directory exists
      - /var/run/docker.sock:/var/run/docker.sock:ro # optional, for docker integrations
    restart: unless-stopped
```

or docker run:

```bash
docker run --name homepage \
  -e PUID=1000 \
  -e PGID=1000 \
  -p 3000:3000 \
  -v /path/to/config:/app/config \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/gethomepage/homepage:latest
```

## With Node

First, clone the repository:

```bash
git clone https://github.com/gethomepage/homepage.git
```

Then install dependencies and build the production bundle (I'm using pnpm here, you can use npm or yarn if you like):

```bash
pnpm install
pnpm build
```

If this is your first time starting, copy the `src/skeleton` directory to `config/` to populate initial example config files.

Finally, run the server in production mode:

```bash
pnpm start
```

or development mode:

```bash
pnpm dev
```

# Configuration

Please refer to the [homepage documentation](https://gethomepage.dev/) website for more information. Everything you need to know about configuring Homepage is there. Please read everything carefully before asking for help, as most questions are answered there or are simple YAML configuration issues.

# Development

Install NPM packages, this project uses [pnpm](https://pnpm.io/) (and so should you!):

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start.

This is a [Next.js](https://nextjs.org/) application, see their documentation for more information.

# Documentation

The homepage documentation is available at [https://gethomepage.dev/](https://gethomepage.dev/).

Homepage uses Material for MkDocs for documentation. To run the documentation locally, first install the dependencies:

```bash
pip install -r requirements.txt
```

Then run the development server:

```bash
mkdocs serve # or build, to build the static site
```

# Support & Suggestions

If you have any questions, suggestions, or general issues, please start a discussion on the [Discussions](https://github.com/gethomepage/homepage/discussions) page.

## Contributing & Contributors

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

Thanks to the over 200 contributors who have helped make this project what it is today!

Especially huge thanks to [@shamoon](https://github.com/shamoon), who has been the backbone of this community from the very start.
