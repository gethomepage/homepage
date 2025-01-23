---
title: Source Installation
description: Install and run homepage from source
---

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

Finally, run the server:

```bash
pnpm start
```

When updating homepage versions you will need to re-build the static files i.e. repeat the process above.
