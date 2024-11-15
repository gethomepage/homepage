---
title: Favicons
description: Favicon Configuration
---

Favicons are configured in the `favicons.yaml` file. They function much the same as [Bookmarks](bookmarks.md), in how groups and lists work. They're just simple icons with no extra features other than being a link out.

The design of homepage expects `abbr` to be 2 letters, but is not otherwise forced. The `abbr` shows if the icon is not specified.

You should use an icon for favicons similar to the [options for service icons](services.md#icons). If both icon and abbreviation are supplied, the icon takes precedence.


```yaml
---
- Developer:
    - Github:
        - abbr: GH
          name: Github
          icon: github.png
          href: https://github.com/
    - Gitlab:
        - abbr: GL
          name: Gitlab
          icon: gitlab.png
          href: https://gitlab.com

- Media:
    - Jellyfin:
        - abbr: JE
          name: jellyfin
          icon: jellyfin.png
          href: https://jellyfin.org
    - Emby:
        - abbr: EM
          name: emby
          icon: emby.png
          href: https://emby.media
    - Youtube:
        - abbr: YT
          name: youtube
          icon: youtube.png
          href: https://youtube.com/
    - Spotify:
        - abbr: SP
          name: spotify
          icon: spotify.png
          href: https://spotify.com/

```

which renders to (depending on your theme):

<img width="1000" alt="Favicons" src="">

The default [favicons.yaml](https://github.com/gethomepage/homepage/blob/main/src/skeleton/favicons.yaml) is a working example.
