---
title: Development
description: Homepage Development
---

## Development Overview

First, clone the homepage repository.

For installing NPM packages, this project uses [pnpm](https://pnpm.io/) (and so should you!):

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start.

This is a [Next.js](https://nextjs.org/) application, see their documentation for more information.

## Code Linting

Once dependencies have been installed you can lint your code with

```bash
pnpm lint
```

## Service Widget Guidelines

To ensure cohesiveness of various widgets, the following should be used as a guide for developing new widgets:

-   Please only submit widgets that have been requested and have at least 5 'up-votes'
-   Widgets should be only one row of blocks
-   Widgets should be no more than 4 blocks wide
-   Minimize the number of API calls
-   Avoid the use of custom proxy unless absolutely necessary
