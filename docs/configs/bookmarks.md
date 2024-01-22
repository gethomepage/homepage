---
title: Bookmarks
description: Bookmark Configuration
---

Bookmarks are configured in the `bookmarks.yaml` file. They function much the same as [Services](services.md), in how groups and lists work. They're just much simpler, smaller, and contain no extra features other than being a link out.

The design of homepage expects `abbr` to be 2 letters, but is not otherwise forced.

You can also use an icon for bookmarks similar to the [options for service icons](services.md#icons). If both icon and abbreviation are supplied, the icon takes precedence.

By default, the description will use the hostname of the link, but you can override it with a custom description.

```yaml
---
- Developer:
    - Github:
        - abbr: GH
          href: https://github.com/

- Social:
    - Reddit:
        - icon: reddit.png
          href: https://reddit.com/
          description: The front page of the internet

- Entertainment:
    - YouTube:
        - abbr: YT
          href: https://youtube.com/
```

which renders to (depending on your theme, etc.):

<img width="1000" alt="Bookmarks" src="https://user-images.githubusercontent.com/19408/269307009-d7e45885-230f-4e07-b421-9822017ae878.png">

The default [bookmarks.yaml](https://github.com/gethomepage/homepage/blob/main/src/skeleton/bookmarks.yaml) is a working example.
