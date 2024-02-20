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

## Code formatting with pre-commit hooks

To ensure a consistent style and formatting across the project source, the project utilizes Git [`pre-commit`](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) hooks to perform some formatting and linting before a commit is allowed.

Once installed, hooks will run when you commit. If the formatting isn't quite right, the commit will be rejected and you'll need to look at the output and fix the issue. Most hooks will automatically format failing files, so all you need to do is `git add` those files again and retry your commit.

See the [pre-commit documentation](https://pre-commit.com/#install) to get started.

## New Feature Guidelines

- New features should be linked to an existing feature request with at least 10 'up-votes'. The purpose of this requirement is to avoid the addition (and maintenance) of features that might only benefit a small number of users.
- If you have ideas for a larger feature, please open a discussion first.
- Please note that though it is a requirement, a discussion with 10 'up-votes' in no way guarantees that a PR will be merged.

## Service Widget Guidelines

To ensure cohesiveness of various widgets, the following should be used as a guide for developing new widgets:

- Please only submit widgets that have been requested and have at least 10 'up-votes'. The purpose of this requirement is to avoid the addition (and maintenance) of service widgets that might only benefit a small number of users.
- Widgets should be only one row of blocks
- Widgets should be no more than 4 blocks wide and generally conform to the styling / design choices of other widgets
- Minimize the number of API calls
- Avoid the use of custom proxy unless absolutely necessary
- Widgets should be 'read-only', as in they should not make write changes using the relevant tool's API. Homepage widgets are designed to surface information, not to be a (usually worse) replacement for the tool itself.
