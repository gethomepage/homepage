---
title: Getting Started
description: Get started developing for Homepage.
---

We'll cover getting homepage up and running on your local machine for development, as well as some guidelines for developing new features and widgets.

## Development

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

## Preferring self-hosted open-source software

In general, homepage is meant to be a dashboard for 'self-hosted' services and we believe it is a small way we can help showcase this kind of software. While exceptions are made, mostly when there is no viable
self-hosted / open-source alternative, we ask that any widgets, etc. are developed primarily for a self-hosted tool.

## New Feature Guidelines

- New features should be linked to an existing feature request. The purpose of this requirement is to avoid the addition (and maintenance) of features that might only benefit a small number of users.
- If you have ideas for a larger feature you may want to open a discussion first.

## Service Widget Guidelines

To ensure cohesiveness of various widgets, the following should be used as a guide for developing new widgets:

- Please only submit widgets that target a feature request discussion with at least 20 'up-votes'. The purpose of this requirement is to avoid the addition (and maintenance) of service widgets that might only benefit a small number of users.
- Note that we reserve the right to decline widgets for projects that are very young (eg < ~1y) or those with a small reach (eg low GitHub stars). Again, this is in an effort to keep overall widget maintenance under control.
- Widgets should be only one row of blocks
- Widgets should be no more than 4 blocks wide and generally conform to the styling / design choices of other widgets
- Minimize the number of API calls
- Avoid the use of custom proxy unless absolutely necessary
- Widgets should be 'read-only', as in they should not make write changes using the relevant tool's API. Homepage widgets are designed to surface information, not to be a (usually worse) replacement for the tool itself.
