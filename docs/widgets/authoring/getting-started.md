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

## Testing

Homepage uses [Vitest](https://vitest.dev/) for unit and component tests.

Run the test suite:

```bash
pnpm test
```

Run the test suite with coverage:

```bash
pnpm test:coverage
```

### What tests to include

- New or updated widgets should generally include a component test near the widget component (for example `src/widgets/<widget>/component.test.jsx`) that covers realistic behavior: loading/placeholder state, error state, and a representative "happy path" render.
- If you add or change a widget definition file (`src/widgets/<widget>/widget.js`), add/update its corresponding unit test (`src/widgets/<widget>/widget.test.js`) to cover the config/mapping behavior.
- If your widget requires a custom proxy (`src/widgets/<widget>/proxy.js`), add a proxy unit test (`src/widgets/<widget>/proxy.test.js`) that validates:
  - request construction (URL, query params, headers/auth)
  - response mapping (what the widget consumes)
  - error pathways (upstream error, unexpected payloads)
- Avoid placing test files under `src/pages/**` (Next.js treats files there as routes). Page tests should live under `src/__tests__/pages/**`.

## Code formatting with pre-commit hooks

To ensure a consistent style and formatting across the project source, the project utilizes Git [`pre-commit`](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) hooks to perform some formatting and linting before a commit is allowed.

Once installed, hooks will run when you commit. If the formatting isn't quite right, the commit will be rejected and you'll need to look at the output and fix the issue. Most hooks will automatically format failing files, so all you need to do is `git add` those files again and retry your commit.

See the [pre-commit documentation](https://pre-commit.com/#install) to get started.

## Preferring self-hosted open-source software

In general, homepage is meant to be a dashboard for 'self-hosted' services and we believe it is a small way we can help showcase this kind of software. While exceptions are made, mostly when there is no viable
self-hosted / open-source alternative, we ask that any widgets, etc. are developed primarily for a self-hosted tool.

## New Feature or Enhancement Guidelines {#new-feature-guidelines}

- New features or enhancements, **no matter how small**, must be linked to an existing feature request with some comments or 'up-votes' that demonstrate community interest. The purpose of this requirement is to avoid the addition (and maintenance) of features that might only benefit a small number of users.
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
- Widgets should not allow manually overriding the "refresh interval" setting, as misconfigured refresh intervals can easily lead to performance issues for users.
