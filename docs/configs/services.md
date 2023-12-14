---
title: Services
description: Service Configuration
---

Services are configured inside the `services.yaml` file. You can have any number of groups, and any number of services per group.

## Groups

Groups are defined as top-level array entries.

```yaml
- Group A:
    - Service A:
        href: http://localhost/

- Group B:
    - Service B:
        href: http://localhost/
```

<img width="1038" alt="Service Groups" src="https://user-images.githubusercontent.com/82196/187040754-28065242-4534-4409-881c-93d1921c6141.png">

## Services

Services are defined as array entries on groups,

```yaml
- Group A:
    - Service A:
        href: http://localhost/

    - Service B:
        href: http://localhost/

    - Service C:
        href: http://localhost/

- Group B:
    - Service D:
        href: http://localhost/
```

<img width="1038" alt="Service Services" src="https://user-images.githubusercontent.com/82196/187040763-038023a2-8bee-4d87-b5cc-13447e7365a4.png">

## Descriptions

Services may have descriptions,

```yaml
- Group A:
    - Service A:
        href: http://localhost/
        description: This is my service

- Group B:
    - Service B:
        href: http://localhost/
        description: This is another service
```

<img width="1038" alt="Service Descriptions" src="https://user-images.githubusercontent.com/82196/187040817-11a3d0eb-c997-4ef9-8f06-2d03a11332b6.png">

## Icons

Services may have an icon attached to them, you can use icons from [Dashboard Icons](https://github.com/walkxcode/dashboard-icons) automatically, by passing the name of the icon, with, or without `.png` or with `.svg` to use the svg version.

You can also specify prefixed icons from [Material Design Icons](https://materialdesignicons.com) with `mdi-XX` or [Simple Icons](https://simpleicons.org/) with `si-XX`.

You can specify a custom color by adding a hex color code as suffix e.g. `mdi-XX-#f0d453` or `si-XX-#a712a2`.

To use a remote icon, use the absolute URL (e.g. `https://...`).

To use a local icon, first create a Docker mount to `/app/public/icons` and then reference your icon as `/icons/myicon.png`. You will need to restart the container when adding new icons.

!!! warning

      Material Design Icons for **brands** were deprecated and may be removed in the future. Using Simple Icons for brand icons will prevent any issues if / when the Material Design Icons are removed.

```yaml
- Group A:
    - Sonarr:
        icon: sonarr.png
        href: http://sonarr.host/
        description: Series management

- Group B:
    - Radarr:
        icon: radarr.png
        href: http://radarr.host/
        description: Movie management

- Group C:
    - Service:
        icon: mdi-flask-outline
        href: http://service.host/
        description: My cool service
```

<img width="1038" alt="Service Icons" src="https://user-images.githubusercontent.com/82196/187040777-da1361d7-f0c4-4531-95db-136cd00a1611.png">

## Ping

Services may have an optional `ping` property that allows you to monitor the availability of an external host. As of v0.8.0, the ping feature attempts to use a true (ICMP) ping command on the underlying host.

```yaml
- Group A:
    - Sonarr:
        icon: sonarr.png
        href: http://sonarr.host/
        ping: sonarr.host

- Group B:
    - Radarr:
        icon: radarr.png
        href: http://radarr.host/
        ping: some.other.host
```

<img width="1038" alt="Ping" src="https://github.com/gethomepage/homepage/assets/88257202/7bc13bd3-0d0b-44e3-888c-a20e069a3233">

You can also apply different styles to the ping indicator by using the `statusStyle` property, see [settings](settings.md#status-style).

## Site Monitor

Services may have an optional `siteMonitor` property (formerly `ping`) that allows you to monitor the availability of a URL you chose and have the response time displayed. You do not need to set your monitor URL equal to your href or ping URL.

!!! note

    The site monitor feature works by making an http `HEAD` request to the URL, and falls back to `GET` in case that fails. It will not, for example, login if the URL requires auth or is behind e.g. Authelia. In the case of a reverse proxy and/or auth this usually requires the use of an 'internal' URL to make the site monitor feature correctly display status.

```yaml
- Group A:
    - Sonarr:
        icon: sonarr.png
        href: http://sonarr.host/
        siteMonitor: http://sonarr.host/

- Group B:
    - Radarr:
        icon: radarr.png
        href: http://radarr.host/
        siteMonitor: http://some.other.host/
```

You can also apply different styles to the site monitor indicator by using the `statusStyle` property, see [settings](settings.md#status-style).

## Docker Integration

Services may be connected to a Docker container, either running on the local machine, or a remote machine.

```yaml
- Group A:
    - Service A:
        href: http://localhost/
        description: This is my service
        server: my-server
        container: my-container

- Group B:
    - Service B:
        href: http://localhost/
        description: This is another service
        server: other-server
        container: other-container
```

<img width="1038" alt="Service Containers" src="https://github.com/gethomepage/homepage/assets/88257202/4c685783-52c6-4e55-afb3-affe9baac09b">

**Clicking on the status label of a service with Docker integration enabled will expand the container stats, where you can see CPU, Memory, and Network activity.**

!!! note

      This can also be controlled with `showStats`. See [show docker stats](docker.md#show-docker-stats) for more information

<img width="1038" alt="Docker Stats Expanded" src="https://github.com/gethomepage/homepage/assets/88257202/f95fd595-449e-48ae-af67-fd89618904ec">

## Service Integrations

Services may also have a service widget (or integration) attached to them, this works independently of the Docker integration.

You can find information and configuration for each of the supported integrations on the [Widgets](../widgets/index.md) page.

Here is an example of a Radarr & Sonarr service, with their respective integrations.

```yaml
- Group A:
    - Sonarr:
        icon: sonarr.png
        href: http://sonarr.host/
        description: Series management
        widget:
          type: sonarr
          url: http://sonarr.host
          key: apikeyapikeyapikeyapikeyapikey

- Group B:
    - Radarr:
        icon: radarr.png
        href: http://radarr.host/
        description: Movie management
        widget:
          type: radarr
          url: http://radarr.host
          key: apikeyapikeyapikeyapikeyapikey
```

<img width="1038" alt="Service Integrations" src="https://user-images.githubusercontent.com/82196/187040838-6cd518c2-4f08-41ef-8aa6-364df5e2660e.png">
