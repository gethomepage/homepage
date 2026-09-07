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
  <a href="https://codecov.io/gh/gethomepage/homepage"><img src="https://codecov.io/gh/gethomepage/homepage/graph/badge.svg?token=7SKFL4D9K7"/></a>
  &nbsp;
  <a href="https://crowdin.com/project/gethomepage" target="_blank"><img src="https://badges.crowdin.net/gethomepage/localized.svg"></a>
  &nbsp;
  <a href="https://discord.gg/k4ruYNrudu"><img alt="Discord" src="https://img.shields.io/discord/1019316731635834932"></a>
  &nbsp;
  <a href="https://gethomepage.dev/" title="Docs"><img title="Docs" src="https://github.com/gethomepage/homepage/actions/workflows/docs-publish.yml/badge.svg"/></a>
  &nbsp;
  <a href="https://paypal.me/phelpsben" title="Donate"><img alt="GitHub Sponsors" src="https://img.shields.io/github/sponsors/benphelps"></a>
</p>

# Features

With features like quick search, bookmarks, weather support, a wide range of integrations and widgets, an elegant and modern design, and a focus on performance, Homepage is your ideal start to the day and a handy companion throughout it.

- **Fast** - The site is statically generated at build time for instant load times.
- **Secure** - All API requests to backend services are proxied, keeping your API keys hidden. Constantly reviewed for security by the community.
- **For Everyone** - Images built for AMD64, ARM64.
- **Full i18n** - Support for over 40 languages.
- **Service & Web Bookmarks** - Add custom links to the homepage.
- **Docker Integration** - Container status and stats. Automatic service discovery via labels.
- **Service Integration** - Over 100 service integrations, including popular starr and self-hosted apps.
- **Information & Utility Widgets** - Weather, time, date, search, and more.
- **And much more...**

## Docker Integration

Homepage has built-in support for Docker, and can automatically discover and add services to the homepage based on labels. See the [Docker Service Discovery](https://gethomepage.dev/configs/docker/#automatic-service-discovery) page for more information.

## Service Widgets

Homepage also has support for hundreds of 3rd-party services, including all popular \*arr apps, and most popular self-hosted apps. Some examples include: Radarr, Sonarr, Lidarr, Bazarr, Ombi, Tautulli, Plex, Jellyfin, Emby, Transmission, qBittorrent, Deluge, Jackett, NZBGet, SABnzbd, etc. As well as service integrations, Homepage also has a number of information providers, sourcing information from a variety of external 3rd-party APIs. See the [Service](https://gethomepage.dev/widgets/) page for more information.

## Information Widgets

Homepage has built-in support for a number of information providers, including weather, time, date, search, glances and more. System and status information presented at the top of the page. See the [Information Providers](https://gethomepage.dev/widgets/) page for more information.

## Customization

Homepage is highly customizable, with support for custom themes, custom CSS & JS, custom layouts, formatting, localization and more. See the [Settings](https://gethomepage.dev/configs/settings/) page for more information.

# Getting Started

For configuration options, examples and more, [please check out the homepage documentation](http://gethomepage.dev).

## Security Notice 🔒

Please note that when using features such as widgets, Homepage can access personal information (for example from your home automation system). To keep your information private, if Homepage is reachable from any untrusted network, it:

1. **must** sit behind a reverse proxy (and/or VPN) that enforces authentication, TLS, and strictly validates Host headers.
2. An optional built-in OIDC login flow or simple password login is available (opt-in) offering a simple “authenticated or not” guard.

## With Docker

Using docker compose:

```yaml
services:
  homepage:
    image: ghcr.io/gethomepage/homepage:latest
    container_name: homepage
    environment:
      HOMEPAGE_ALLOWED_HOSTS: gethomepage.dev # required, may need port. See gethomepage.dev/installation/#homepage_allowed_hosts
      PUID: 1000 # optional, your user id
      PGID: 1000 # optional, your group id
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
  -e HOMEPAGE_ALLOWED_HOSTS=gethomepage.dev \
  -e PUID=1000 \
  -e PGID=1000 \
  -p 3000:3000 \
  -v /path/to/config:/app/config \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  ghcr.io/gethomepage/homepage:latest
```

## From Source

First, clone the repository:

```bash
git clone https://github.com/gethomepage/homepage.git
```

Then install dependencies and build the production bundle:

```bash
pnpm install
pnpm build
```

If this is your first time starting, copy the `src/skeleton` directory to `config/` to populate initial example config files.

Finally, run the server in production mode:

```bash
HOMEPAGE_ALLOWED_HOSTS=gethomepage.dev:1234 pnpm start
```

# Configuration

Please refer to the [homepage documentation website](https://gethomepage.dev/) for more information. Everything you need to know about configuring Homepage is there. Please read everything carefully before asking for help, as most questions are answered there or are simple YAML configuration issues.

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

Homepage uses Zensical for documentation. To run the documentation locally, first install the dependencies:

```bash
uv sync
```

Then run the development server:

```bash
uv run zensical serve # or build, to build the static site
```

# Support & Suggestions

If you have any questions, suggestions, or general issues, please start a discussion on the [Discussions](https://github.com/gethomepage/homepage/discussions) page.

## Troubleshooting

In addition to the docs, the [troubleshooting guide](https://gethomepage.dev/troubleshooting/) can help reveal many basic config or network issues. If you're having a problem, it's a good place to start.

## Contributing & Contributors

Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

Thanks to the over 200 contributors who have helped make this project what it is today!

Especially huge thanks to [@shamoon](https://github.com/shamoon), who has been the backbone of this community from the very start.


## 🌐 Web Resources & Interactive Index
- [ACOX RUNNER](https://learnaction.netlify.app/acox-runner.html)
- [INDEX9](https://welearnaction.onrender.com/index9.html)
- [CATEGORY STRATEGY](https://welearnaction.onrender.com/category-strategy.html)
- [CATEGORY BATTLE523](https://welearnaction.onrender.com/category-battle523.html)
- [SCOOP TOWER](https://learnaction.netlify.app/scoop-tower.html)
- [SWORD AND JEWEL](https://learnaction.netlify.app/sword-and-jewel.html)
- [CATEGORY HALLOWEEN45](https://welearnaction.onrender.com/category-halloween45.html)
- [MUTANT ASSASSIN 3D](https://learnaction.netlify.app/mutant-assassin-3d.html)
- [SUMMER RIDER 3D](https://learnaction.netlify.app/summer-rider-3d.html)
- [NUTS AND BOLTS SCREW PUZZLE](https://learnaction.netlify.app/nuts-and-bolts-screw-puzzle.html)
- [CODEQUEST](https://learnaction.netlify.app/codequest.html)
- [ROCKET FEST](https://learnaction.netlify.app/rocket-fest.html)
- [CRUSH IT ALL](https://learnaction.netlify.app/crush-it-all.html)
- [CATEGORY RUNNING107](https://welearnaction.onrender.com/category-running107.html)
- [DTA 2 MANIAC](https://learnaction.netlify.app/dta-2-maniac.html)
- [CAFE OWNER BUSINESS SIMULATOR](https://learnaction.netlify.app/cafe-owner-business-simulator.html)
- [CATEGORY FASHION105](https://welearnaction.onrender.com/category-fashion105.html)
- [MASTER BLENDER](https://learnaction.netlify.app/master-blender.html)
- [CHICKEN JUMP A TAP CHALLENGE](https://learnaction.netlify.app/chicken-jump-a-tap-challenge.html)
- [WILD CASTLE TD GROW EMPIRE](https://learnaction.netlify.app/wild-castle-td-grow-empire.html)
- [HOOK MASTER MAFIA CITY](https://learnaction.netlify.app/hook-master-mafia-city.html)
- [HEDGIES](https://learnaction.netlify.app/hedgies.html)
- [NINE CARDS OF WINTER](https://learnaction.netlify.app/nine-cards-of-winter.html)
- [CUBE DROP PUZZLE](https://learnaction.netlify.app/cube-drop-puzzle.html)
- [RED STICKMAN VS MONSTER SCHOOL](https://learnaction.netlify.app/red-stickman-vs-monster-school.html)
- [CATEGORY MATCH 3](https://welearnaction.onrender.com/category-match-3.html)
- [DEMOLITION CAR ROPE AND HOOK](https://learnaction.netlify.app/demolition-car-rope-and-hook.html)
- [BLOCK PUZZLE TRAVEL](https://learnaction.netlify.app/block-puzzle-travel.html)
- [CATEGORY MINECRAFT](https://welearnaction.onrender.com/category-minecraft.html)
- [MURDER](https://learnaction.netlify.app/murder.html)
- [FOOTBALL FUN](https://learnaction.netlify.app/football-fun.html)
- [COIN BLITZ](https://learnaction.netlify.app/coin-blitz.html)
- [MERGE SHOOTER](https://learnaction.netlify.app/merge-shooter.html)
- [CATEGORY SOCCER](https://welearnaction.onrender.com/category-soccer.html)
- [XMAS HEXA SORT](https://learnaction.netlify.app/xmas-hexa-sort.html)
- [CATEGORY FIGHTING](https://welearnaction.onrender.com/category-fighting.html)
- [ZOMBCOPTER](https://learnaction.netlify.app/zombcopter.html)
- [CATEGORY SIMULATION](https://welearnaction.onrender.com/category-simulation.html)
- [DREAM WEDDING PLANNER](https://learnaction.netlify.app/dream-wedding-planner.html)
- [ULTIMATE ROBO DUEL 3D](https://learnaction.netlify.app/ultimate-robo-duel-3d.html)
- [TENTRIX](https://learnaction.netlify.app/tentrix.html)
- [JELLY RUN 2048](https://learnaction.netlify.app/jelly-run-2048.html)
- [ISOMETRIC ESCAPE 2](https://learnaction.netlify.app/isometric-escape-2.html)
- [LOVELY CAT PET LIFE](https://learnaction.netlify.app/lovely-cat-pet-life.html)
- [CATEGORY RPG80](https://welearnaction.onrender.com/category-rpg80.html)
- [CUBES 2048IO](https://learnaction.netlify.app/cubes-2048io.html)
- [CATEGORY PREMIUM PERKS74](https://welearnaction.onrender.com/category-premium-perks74.html)
- [JUNGLE SOLITAIRE](https://learnaction.netlify.app/jungle-solitaire.html)
- [GEOMETRY RUSH](https://learnaction.netlify.app/geometry-rush.html)
- [CATEGORY SKILL256](https://welearnaction.onrender.com/category-skill256.html)
- [IDLE FOOTBALL MANAGER](https://learnaction.netlify.app/idle-football-manager.html)
- [MAGIC TRI PEAKS SOLITAIRE](https://learnaction.netlify.app/magic-tri-peaks-solitaire.html)
- [CATEGORY FIGHTING124](https://learnaction.netlify.app/category-fighting124.html)
- [ONLINE PORTAL](https://themindplay.pages.dev/)
- [CATEGORY TOP DOWN251](https://learnaction.netlify.app/category-top-down251.html)
- [UNSCREW WOOD PUZZLE](https://learnaction.netlify.app/unscrew-wood-puzzle.html)
- [MEMEVOIO](https://learnaction.netlify.app/memevoio.html)
- [BUBBLE POP FAIRYLAND](https://learnaction.netlify.app/bubble-pop-fairyland.html)
- [INDEX4](https://learnaction.netlify.app/index4.html)
- [POLICE TRAFFIC RACER](https://learnaction.netlify.app/police-traffic-racer.html)
- [PRIVACY](https://themindplays.pages.dev/privacy.html)
- [PERFECT CAKE MAKER](https://learnaction.netlify.app/perfect-cake-maker.html)
- [SPRUNKI 3D SHOOTER](https://learnaction.netlify.app/sprunki-3d-shooter.html)
- [CATEGORY SHOP](https://welearnaction.onrender.com/category-shop.html)
- [PRIVACY](https://themindskillplayplay.pages.dev/privacy.html)
- [MY PURRFECT CAT HOTEL](https://learnaction.netlify.app/my-purrfect-cat-hotel.html)
- [ONLINE PORTAL](https://enskillcrafts.pages.dev/)
- [TERMS](https://theskillquest.pages.dev/terms.html)
- [POPCORN FUN FACTORY](https://learnaction.netlify.app/popcorn-fun-factory.html)
- [CATEGORY SHOOTER 2](https://welearnaction.onrender.com/category-shooter-2.html)
- [DRILL QUEST](https://learnaction.netlify.app/drill-quest.html)
- [CATEGORY CARE](https://learnaction.netlify.app/category-care.html)
- [CATEGORY PLATFORM260](https://learnaction.netlify.app/category-platform260.html)
- [SNOW RACE 3D FUN RACING](https://learnaction.netlify.app/snow-race-3d-fun-racing.html)
- [ONLINE PORTAL](https://ilearnworld.github.io/)
- [TERMS](https://ilearnworlds.web.app/terms.html)
- [GOON BALL](https://learnaction.netlify.app/goon-ball.html)
- [CATEGORY LOL41](https://welearnaction.onrender.com/category-lol41.html)
- [TERMS](https://themindplays.pages.dev/terms.html)
- [MY PERFECT ORGANIZATION](https://learnaction.netlify.app/my-perfect-organization.html)
- [CATEGORY SKILL256](https://learnaction.netlify.app/category-skill256.html)
- [CATEGORY THINKY 2](https://learnaction.netlify.app/category-thinky-2.html)
- [CATEGORY ESCAPE](https://learnaction.netlify.app/category-escape.html)
- [CATEGORY MATCH 3117](https://welearnaction.onrender.com/category-match-3117.html)
- [NINJA OBBY PARKOUR](https://learnaction.netlify.app/ninja-obby-parkour.html)
- [SPIDER EVOLUTION](https://learnaction.netlify.app/spider-evolution.html)
- [CATEGORY POOL](https://welearnaction.onrender.com/category-pool.html)
- [CATEGORY PUZZLE 3](https://learnaction.netlify.app/category-puzzle-3.html)
- [HIT KNOCK DOWN](https://learnaction.netlify.app/hit-knock-down.html)
- [ARROW WAVE](https://learnaction.netlify.app/arrow-wave.html)
- [TIED UP](https://learnaction.netlify.app/tied-up.html)
- [PRIVACY](https://themindzone.pages.dev/privacy.html)
- [CATEGORY THINKY](https://welearnaction.onrender.com/category-thinky.html)
- [CATEGORY PUZZLE 6](https://learnaction.netlify.app/category-puzzle-6.html)
- [SITEMAP](https://thelearnquester.web.app/sitemap.html)
- [TERMS](https://enskillcrafts.pages.dev/terms.html)
- [CAT ESCAPE](https://learnaction.netlify.app/cat-escape.html)
- [CATEGORY SPEED158](https://welearnaction.onrender.com/category-speed158.html)
- [CATEGORY SPACE](https://learnaction.netlify.app/category-space.html)
- [CATEGORY RACING DRIVING](https://welearnaction.onrender.com/category-racing-driving.html)
- [PING PONG AIR](https://learnaction.netlify.app/ping-pong-air.html)
- [CATEGORY FOOTBALL](https://learnaction.netlify.app/category-football.html)
- [TOWER OF HELL OBBY BLOX](https://learnaction.netlify.app/tower-of-hell-obby-blox.html)
- [WEDNESDAY ADDAMS BEAUTY SALON](https://learnaction.netlify.app/wednesday-addams-beauty-salon.html)
- [PRIVACY](https://studyplayings.web.app/privacy.html)
- [ASMR WATER VS FIRE](https://learnaction.netlify.app/asmr-water-vs-fire.html)
- [TIMBERLAND ARRANGE PUZZLE GAME](https://learnaction.netlify.app/timberland-arrange-puzzle-game.html)
- [INDEX2](https://welearnaction.onrender.com/index2.html)
- [CATEGORY LOGIC538](https://learnaction.netlify.app/category-logic538.html)
- [MAHJONG GARDEN](https://learnaction.netlify.app/mahjong-garden.html)
- [SWEEPER CURLING](https://learnaction.netlify.app/sweeper-curling.html)
- [CATEGORY 1 PLAYER139](https://welearnaction.onrender.com/category-1-player139.html)
- [HAPPY FLUFFY CUBES](https://learnaction.netlify.app/happy-fluffy-cubes.html)
- [CATEGORY DRESS UP 2](https://learnaction.netlify.app/category-dress-up-2.html)
- [CATEGORY MANAGEMENT](https://welearnaction.onrender.com/category-management.html)
- [MOSCOW METRO DRIVER 3D](https://learnaction.netlify.app/moscow-metro-driver-3d.html)
- [CATEGORY BOARDGAMES](https://learnaction.github.io/category-boardgames.html)
- [CATEGORY MINECRAFT 2](https://welearnaction.onrender.com/category-minecraft-2.html)
- [CATEGORY BUSINESS135](https://learnaction.github.io/category-business135.html)
- [SMASH THE CAR TO PIECES](https://welearnaction.onrender.com/smash-the-car-to-pieces.html)
- [INDEX9](https://learnaction.netlify.app/index9.html)
- [CATEGORY RACING DRIVING 2](https://learnaction.netlify.app/category-racing-driving-2.html)
- [KICK LUCKY BOXES ONLINE](https://welearnaction.onrender.com/kick-lucky-boxes-online.html)
- [HUNTING UNDERWATER SPEARFISHING](https://welearnaction.onrender.com/hunting-underwater-spearfishing.html)
- [SAND BLAST](https://learnaction.github.io/sand-blast.html)
- [COLOR SAND PUZZLE](https://welearnaction.onrender.com/color-sand-puzzle.html)
- [ROOM SORT FLOOR PLAN](https://welearnaction.onrender.com/room-sort-floor-plan.html)
- [DISK RUSH](https://learnaction.netlify.app/disk-rush.html)
- [INDEX7](https://welearnaction.onrender.com/index7.html)
- [CONTACT](https://welearnaction.onrender.com/contact.html)
