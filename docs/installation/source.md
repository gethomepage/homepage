---
title: Source Installation
description: Install and run homepage from source
---

First, clone the repository:

```bash
git clone https://github.com/gethomepage/homepage.git
```

If `pnpm` is not installed, install it:

```bash
npm install -g pnpm
```

Then install dependencies and build the production bundle:

```bash
pnpm install
pnpm build
```

If this is your first time starting, copy the `src/skeleton` directory to `config/` to populate initial example config files.

Finally, run the server:

```bash
HOMEPAGE_ALLOWED_HOSTS=gethomepage.dev:1234 pnpm start
```

When updating Homepage versions, rebuild the production bundle by repeating the steps above.

See [HOMEPAGE_ALLOWED_HOSTS](index.md#homepage_allowed_hosts) for more information on this environment variable.
